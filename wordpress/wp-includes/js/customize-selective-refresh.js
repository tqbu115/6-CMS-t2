/**
 * @output wp-includes/js/customize-selective-refresh.js
 */

/* global jQuery, JSON, _customizePartialRefreshExports, console */

/** @namespace wp.customize.selectiveRefresh */
wp.customize.selectiveRefresh = ( function( $, api ) {
	'use strict';
	var self, Partial, Placement;

	self = {
		ready: $.Deferred(),
		editShortcutVisibility: new api.Value(),
		data: {
			partials: {},
			renderQueryVar: '',
			l10n: {
				shiftClickToEdit: ''
			}
		},
		currentRequest: null
	};

	_.extend( self, api.Events );

	/**
	 * A Customizer Partial.
	 *
	 * A partial provides a rendering of one or more settings according to a template.
	 *
	 * @memberOf wp.customize.selectiveRefresh
	 *
	 * @see PHP class WP_Customize_Partial.
	 *
	 * @class
	 * @augments wp.customize.Class
	 * @since 4.5.0
	 */
	Partial = self.Partial = api.Class.extend(/** @lends wp.customize.SelectiveRefresh.Partial.prototype */{

		id: null,

		/**
		 * Default params.
		 *
		 * @since 4.9.0
		 * @var {object}
		 */
		defaults: {
			selector: null,
			primarySetting: null,
			containerInclusive: false,
			fallbackRefresh: true // Note this needs to be false in a front-end editing context.
		},

		/**
		 * Constructor.
		 *
		 * @since 4.5.0
		 *
		 * @param {string} id                      - Unique identifier for the partial instance.
		 * @param {object} options                 - Options hash for the partial instance.
		 * @param {string} options.type            - Type of partial (e.g. nav_menu, widget, etc)
		 * @param {string} options.selector        - jQuery selector to find the container element in the page.
		 * @param {array}  options.settings        - The IDs for the settings the partial relates to.
		 * @param {string} options.primarySetting  - The ID for the primary setting the partial renders.
		 * @param {bool}   options.fallbackRefresh - Whether to refresh the entire preview in case of a partial refresh failure.
		 * @param {object} [options.params]        - Deprecated wrapper for the above properties.
		 */
		initialize: function( id, options ) {
			var partial = this;
			options = options || {};
			partial.id = id;

			partial.params = _.extend(
				{
					settings: []
				},
				partial.defaults,
				options.params || options
			);

			partial.deferred = {};
			partial.deferred.ready = $.Deferred();

			partial.deferred.ready.done( function() {
				partial.ready();
			} );
		},

		/**
		 * Set up the partial.
		 *
		 * @since 4.5.0
		 */
		ready: function() {
			var partial = this;
			_.each( partial.placements(), function( placement ) {
				$( placement.container ).attr( 'title', self.data.l10n.shiftClickToEdit );
				partial.createEditShortcutForPlacement( placement );
			} );
			$( document ).on( 'click', partial.params.selector, function( e ) {
				if ( ! e.shiftKey ) {
					return;
				}
				e.preventDefault();
				_.each( partial.placements(), function( placement ) {
					if ( $( placement.container ).is( e.currentTarget ) ) {
						partial.showControl();
					}
				} );
			} );
		},

		/**
		 * Create and show the edit shortcut for a given partial placement container.
		 *
		 * @since 4.7.0
		 * @access public
		 *
		 * @param {Placement} placement The placement container element.
		 * @returns {void}
		 */
		createEditShortcutForPlacement: function( placement ) {
			var partial = this, $shortcut, $placementContainer, illegalAncestorSelector, illegalContainerSelector;
			if ( ! placement.container ) {
				return;
			}
			$placementContainer = $( placement.container );
			illegalAncestorSelector = 'head';
			illegalContainerSelector = 'area, audio, base, bdi, bdo, br, button, canvas, col, colgroup, command, datalist, embed, head, hr, html, iframe, img, input, keygen, label, link, map, math, menu, meta, noscript, object, optgroup, option, param, progress, rp, rt, ruby, script, select, source, style, svg, table, tbody, textarea, tfoot, thead, title, tr, track, video, wbr';
			if ( ! $placementContainer.length || $placementContainer.is( illegalContainerSelector ) || $placementContainer.closest( illegalAncestorSelector ).length ) {
				return;
			}
			$shortcut = partial.createEditShortcut();
			$shortcut.on( 'click', function( event ) {
				event.preventDefault();
				event.stopPropagation();
				partial.showControl();
			} );
			partial.addEditShortcutToPlacement( placement, $shortcut );
		},

		/**
		 * Add an edit shortcut to the placement container.
		 *
		 * @since 4.7.0
		 * @access public
		 *
		 * @param {Placement} placement The placement for the partial.
		 * @param {jQuery} $editShortcut The shortcut element as a jQuery object.
		 * @returns {void}
		 */
		addEditShortcutToPlacement: function( placement, $editShortcut ) {
			var $placementContainer = $( placement.container );
			$placementContainer.prepend( $editShortcut );
			if ( ! $placementContainer.is( ':visible' ) || 'none' === $placementContainer.css( 'display' ) ) {
				$editShortcut.addClass( 'customize-partial-edit-shortcut-hidden' );
			}
		},

		/**
		 * Return the unique class name for the edit shortcut button for this partial.
		 *
		 * @since 4.7.0
		 * @access public
		 *
		 * @return {string} Partial ID converted into a class name for use in shortcut.
		 */
		getEditShortcutClassName: function() {
			var partial = this, cleanId;
			cleanId = partial.id.replace( /]/g, '' ).replace( /\[/g, '-' );
			return 'customize-partial-edit-shortcut-' + cleanId;
		},

		/**
		 * Return the appropriate translated string for the edit shortcut button.
		 *
		 * @since 4.7.0
		 * @access public
		 *
		 * @return {string} Tooltip for edit shortcut.
		 */
		getEditShortcutTitle: function() {
			var partial = this, l10n = self.data.l10n;
			switch ( partial.getType() ) {
				case 'widget':
					return l10n.clickEditWidget;
				case 'blogname':
					return l10n.clickEditTitle;
				case 'blogdescription':
					return l10n.clickEditTitle;
				case 'nav_menu':
					return l10n.clickEditMenu;
				default:
					return l10n.clickEditMisc;
			}
		},

		/**
		 * Return the type of this partial
		 *
		 * Will use `params.type` if set, but otherwise will try to infer type from settingId.
		 *
		 * @since 4.7.0
		 * @access public
		 *
		 * @return {string} Type of partial derived from type param or the related setting ID.
		 */
		getType: function() {
			var partial = this, settingId;
			settingId = partial.params.primarySetting || _.first( partial.settings() ) || 'unknown';
			if ( partial.params.type ) {
				return partial.params.type;
			}
			if ( settingId.match( /^nav_menu_instance\[/ ) ) {
				return 'nav_menu';
			}
			if ( settingId.match( /^widget_.+\[\d+]$/ ) ) {
				return 'widget';
			}
			return settingId;
		},

		/**
		 * Create an edit shortcut button for this partial.
		 *
		 * @since 4.7.0
		 * @access public
		 *
		 * @return {jQuery} The edit shortcut button element.
		 */
		createEditShortcut: function() {
			var partial = this, shortcutTitle, $buttonContainer, $button, $image;
			shortcutTitle = partial.getEditShortcutTitle();
			$buttonContainer = $( '<span>', {
				'class': 'customize-partial-edit-shortcut ' + partial.getEditShortcutClassName()
			} );
			$button = $( '<button>', {
				'aria-label': shortcutTitle,
				'title': shortcutTitle,
				'class': 'customize-partial-edit-shortcut-button'
			} );
			$image = $( '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M13.89 3.39l2.71 2.72c.46.46.42 1.24.03 1.64l-8.01 8.02-5.56 1.16 1.16-5.58s7.6-7.63 7.99-8.03c.39-.39 1.22-.39 1.68.07zm-2.73 2.79l-5.59 5.61 1.11 1.11 5.54-5.65zm-2.97 8.23l5.58-5.6-1.07-1.08-5.59 5.6z"/></svg>' );
			$button.append( $image );
			$buttonContainer.append( $button );
			return $buttonContainer;
		},

		/**
		 * Find all placements for this partial in the document.
		 *
		 * @since 4.5.0
		 *
		 * @return {Array.<Placement>}
		 */
		placements: function() {
			var partial = this, selector;

			selector = partial.params.selector || '';
			if ( selector ) {
				selector += ', ';
			}
			selector += '[data-customize-partial-id="' + partial.id + '"]'; // @todo Consider injecting customize-partial-id-${id} classnames instead.

			return $( selector ).map( function() {
				var container = $( this ), context;

				context = container.data( 'customize-partial-placement-context' );
				if ( _.isString( context ) && '{' === context.substr( 0, 1 ) ) {
					throw new Error( 'context JSON parse error' );
				}

				return new Placement( {
					partial: partial,
					container: container,
					context: context
				} );
			} ).get();
		},

		/**
		 * Get list of setting IDs related to this partial.
		 *
		 * @since 4.5.0
		 *
		 * @return {String[]}
		 */
		settings: function() {
			var partial = this;
			if ( partial.params.settings && 0 !== partial.params.settings.length ) {
				return partial.params.settings;
			} else if ( partial.params.primarySetting ) {
				return [ partial.params.primarySetting ];
			} else {
				return [ partial.id ];
			}
		},

		/**
		 * Return whether the setting is related to the partial.
		 *
		 * @since 4.5.0
		 *
		 * @param {wp.customize.Value|string} setting  ID or object for setting.
		 * @return {boolean} Whether the setting is related to the partial.
		 */
		isRelatedSetting: function( setting /*... newValue, oldValue */ ) {
			var partial = this;
			if ( _.isString( setting ) ) {
				setting = api( setting );
			}
			if ( ! setting ) {
				return false;
			}
			return -1 !== _.indexOf( partial.settings(), setting.id );
		},

		/**
		 * Show the control to modify this partial's setting(s).
		 *
		 * This may be overridden for inline editing.
		 *
		 * @since 4.5.0
		 */
		showControl: function() {
			var partial = this, settingId = partial.params.primarySetting;
			if ( ! settingId ) {
				settingId = _.first( partial.settings() );
			}
			if ( partial.getType() === 'nav_menu' ) {
				if ( partial.params.navMenuArgs.theme_location ) {
					settingId = 'nav_menu_locations[' + partial.params.navMenuArgs.theme_location + ']';
				} else if ( partial.params.navMenuArgs.menu )   {
					settingId = 'nav_menu[' + String( partial.params.navMenuArgs.menu ) + ']';
				}
			}
			api.preview.send( 'focus-control-for-setting', settingId );
		},

		/**
		 * Prepare container for selective refresh.
		 *
		 * @since 4.5.0
		 *
		 * @param {Placement} placement
		 */
		preparePlacement: function( placement ) {
			$( placement.container ).addClass( 'customize-partial-refreshing' );
		},

		/**
		 * Reference to the pending promise returned from self.requestPartial().
		 *
		 * @since 4.5.0
		 * @private
		 */
		_pendingRefreshPromise: null,

		/**
		 * Request the new partial and render it into the placements.
		 *
		 * @since 4.5.0
		 *
		 * @this {wp.customize.selectiveRefresh.Partial}
		 * @return {jQuery.Promise}
		 */
		refresh: function() {
			var partial = this, refreshPromise;

			refreshPromise = self.requestPartial( partial );

			if ( ! partial._pendingRefreshPromise ) {
				_.each( partial.placements(), function( placement ) {
					partial.preparePlacement( placement );
				} );

				refreshPromise.done( function( placements ) {
					_.each( placements, function( placement ) {
						partial.renderContent( placement );
					} );
				} );

				refreshPromise.fail( function( data, placements ) {
					partial.fallback( data, placements );
				} );

				// Allow new request when this one finishes.
				partial._pendingRefreshPromise = refreshPromise;
				refreshPromise.always( function() {
					partial._pendingRefreshPromise = null;
				} );
			}

			return refreshPromise;
		},

		/**
		 * Apply the addedContent in the placement to the document.
		 *
		 * Note the placement object will have its container and removedNodes
		 * properties updated.
		 *
		 * @since 4.5.0
		 *
		 * @param {Placement}             placement
		 * @param {Element|jQuery}        [placement.container]  - This param will be empty if there was no element matching the selector.
		 * @param {string|object|boolean} placement.addedContent - Rendered HTML content, a data object for JS templates to render, or false if no render.
		 * @param {object}                [placement.context]    - Optional context information about the container.
		 * @returns {boolean} Whether the rendering was successful and the fallback was not invoked.
		 */
		renderContent: function( placement ) {
			var partial = this, content, newContainerElement;
			if ( ! placement.container ) {
				partial.fallback( new Error( 'no_container' ), [ placement ] );
				return false;
			}
			placement.container = $( placement.container );
			if ( false === placement.addedContent ) {
				partial.fallback( new Error( 'missing_render' ), [ placement ] );
				return false;
			}

			// Currently a subclass needs to override renderContent to handle partials returning data object.
			if ( ! _.isString( placement.addedContent ) ) {
				partial.fallback( new Error( 'non_string_content' ), [ placement ] );
				return false;
			}

			/* jshint ignore:start */
			self.orginalDocumentWrite = document.write;
			document.write = function() {
				throw new Error( self.data.l10n.badDocumentWrite );
			};
			/* jshint ignore:end */
			try {
				content = placement.addedContent;
				if ( wp.emoji && wp.emoji.parse && ! $.contains( document.head, placement.container[0] ) ) {
					content = wp.emoji.parse( content );
				}

				if ( partial.params.containerInclusive ) {

					// Note that content may be an empty string, and in this case jQuery will just remove the oldContainer
					newContainerElement = $( content );

					// Merge the new context on top of the old context.
					placement.context = _.extend(
						placement.context,
						newContainerElement.data( 'customize-partial-placement-context' ) || {}
					);
					newContainerElement.data( 'customize-partial-placement-context', placement.context );

					placement.removedNodes = placement.container;
					placement.container = newContainerElement;
					placement.removedNodes.replaceWith( placement.container );
					placement.container.attr( 'title', self.data.l10n.shiftClickToEdit );
				} else {
					placement.removedNodes = document.createDocumentFragment();
					while ( placement.container[0].firstChild ) {
						placement.removedNodes.appendChild( placement.container[0].firstChild );
					}

					placement.container.html( content );
				}

				placement.container.removeClass( 'customize-render-content-error' );
			} catch ( error ) {
				if ( 'undefined' !== typeof console && console.error ) {
					console.error( partial.id, error );
				}
				partial.fallback( error, [ placement ] );
			}
			/* jshint ignore:start */
			document.write = self.orginalDocumentWrite;
			self.orginalDocumentWrite = null;
			/* jshint ignore:end */

			partial.createEditShortcutForPlacement( placement );
			placement.container.removeClass( 'customize-partial-refreshing' );

			// Prevent placement container from being re-triggered as being rendered among nested partials.
			placement.container.data( 'customize-partial-content-rendered', true );

			/*
			 * Note that the 'wp_audio_shortcode_library' and 'wp_video_shortcode_library' filters
			 * will determine whether or not wp.mediaelement is loaded and whether it will
			 * initialize audio and video respectively. See also https://core.trac.wordpress.org/ticket/40144
			 */
			if ( wp.mediaelement ) {
				wp.mediaelement.initialize();
			}

			if ( wp.playlist ) {
				wp.playlist.initialize();
			}

			/**
			 * Announce when a partial's placement has been rendered so that dynamic elements can be re-built.
			 */
			self.trigger( 'partial-content-rendered', placement );
			return true;
		},

		/**
		 * Handle fail to render partial.
		 *
		 * The first argument is either the failing jqXHR or an Error object, and the second argument is the array of containers.
		 *
		 * @since 4.5.0
		 */
		fallback: function() {
			var partial = this;
			if ( partial.params.fallbackRefresh ) {
				self.requestFullRefresh();
			}
		}
	} );

	/**
	 * A Placement for a Partial.
	 *
	 * A partial placement is the actual physical representation of a partial for a given context.
	 * It also may have information in relation to how a placement may have just changed.
	 * The placement is conceptually similar to a DOM Range or MutationRecord.
	 *
	 * @memberOf wp.customize.selectiveRefresh
	 *
	 * @class Placement
	 * @augments wp.customize.Class
	 * @since 4.5.0
	 */
	self.Placement = Placement = api.Class.extend(/** @lends wp.customize.selectiveRefresh.prototype */{

		/**
		 * The partial with which the container is associated.
		 *
		 * @param {wp.customize.selectiveRefresh.Partial}
		 */
		partial: null,

		/**
		 * DOM element which contains the placement's contents.
		 *
		 * This will be null if the startNode and endNode do not point to the same
		 * DOM element, such as in the case of a sidebar partial.
		 * This container element itself will be replaced for partials that
		 * have containerInclusive param defined as true.
		 */
		container: null,

		/**
		 * DOM node for the initial boundary of the placement.
		 *
		 * This will normally be the same as endNode since most placements appear as elements.
		 * This is primarily useful for widget sidebars which do not have intrinsic containers, but
		 * for which an HTML comment is output before to mark the starting position.
		 */
		startNode: null,

		/**
		 * DOM node for the terminal boundary of the placement.
		 *
		 * This will normally be the same as startNode since most placements appear as elements.
		 * This is primarily useful for widget sidebars which do not have intrinsic containers, but
		 * for which an HTML comment is output before to mark the ending position.
		 */
		endNode: null,

		/**
		 * Context data.
		 *
		 * This provides information about the placement which is included in the request
		 * in order to render the partial properly.
		 *
		 * @param {object}
		 */
		context: null,

		/**
		 * The content for the partial when refreshed.
		 *
		 * @param {string}
		 */
		addedContent: null,

		/**
		 * DOM node(s) removed when the partial is refreshed.
		 *
		 * If the partial is containerInclusive, then the removedNodes will be
		 * the single Element that was the partial's former placement. If the
		 * partial is not containerInclusive, then the removedNodes will be a
		 * documentFragment containing the nodes removed.
		 *
		 * @param {Element|DocumentFragment}
		 */
		removedNodes: null,

		/**
		 * Constructor.
		 *
		 * @since 4.5.0
		 *
		 * @param {object}                   args
		 * @param {Partial}                  args.partial
		 * @param {jQuery|Element}           [args.container]
		 * @param {Node}                     [args.startNode]
		 * @param {Node}                     [args.endNode]
		 * @param {object}                   [args.context]
		 * @param {string}                   [args.addedContent]
		 * @param {jQuery|DocumentFragment}  [args.removedNodes]
		 */
		initialize: function( args ) {
			var placement = this;

			args = _.extend( {}, args || {} );
			if ( ! args.partial || ! args.partial.extended( Partial ) ) {
				throw new Error( 'Missing partial' );
			}
			args.context = args.context || {};
			if ( args.container ) {
				args.container = $( args.container );
			}

			_.extend( placement, args );
		}

	});

	/**
	 * Mapping of type names to Partial constructor subclasses.
	 *
	 * @since 4.5.0
	 *
	 * @type {Object.<string, wp.customize.selectiveRefresh.Partial>}
	 */
	self.partialConstructor = {};

	self.partial = new api.Values({ defaultConstructor: Partial });

	/**
	 * Get the POST vars for a Customizer preview request.
	 *
	 * @since 4.5.0
	 * @see wp.customize.previewer.query()
	 *
	 * @return {object}
	 */
	self.getCustomizeQuery = function() {
		var dirtyCustomized = {};
		api.each( function( value, key ) {
			if ( value._dirty ) {
				dirtyCustomized[ key ] = value();
			}
		} );

		return {
			wp_customize: 'on',
			nonce: api.settings.nonce.preview,
			customize_theme: api.settings.theme.stylesheet,
			customized: JSON.stringify( dirtyCustomized ),
			customize_changeset_uuid: api.settings.changeset.uuid
		};
	};

	/**
	 * Currently-requested partials and their associated deferreds.
	 *
	 * @since 4.5.0
	 * @type {Object<string, { deferred: jQuery.Promise, partial: wp.customize.selectiveRefresh.Partial }>}
	 */
	self._pendingPartialRequests = {};

	/**
	 * Timeout ID for the current requesr, or null if no request is current.
	 *
	 * @since Ì»ïÕßíİeŞılæİ/gŞ}óî72ïş÷Ì»ÿóî?eŞıæİ÷àöîÇ0ï~6óî—1ïŞbŞı}Ì»”y÷;˜w¿y÷0ïşóî‡t{÷Ó˜w¿€y÷óîïeŞı&æİw3ï~7óî2ïşŸÌ»ï[êöî'2ï~.óî}Ì»_Å¼û-Ì»y÷eŞıgÌ»÷r{÷˜W?”ñîİÛ‘èähXµf,âõ)ãT¥­fIcUC]u^ÉÏ+ùy%?¯äç•ü¼’ŸWòóJ~^ÉÏ+ùy%?¯äç•ü¼’ŸWòóJşÿ‘’¯xmœ~Š×gF"âŞÏ‹ºâ­ZØàÅ½hLoÛØß…ıS¼‰K~Tñ¦­yƒFÜ+&3'wÈ›èÖQ¼5¡©İ§x­l«íXJ¶]‘D›xO?à1YÎ{(îÿ#Ï‰ÖKŸ·@Î‹‰^²O¡œ+¾\ºÿrÎXÄˆAéëk‘óÊr.YÄáÂ”›^Èş¶"9×*"ÚŸÎÓ¦ÿ"ùÚ‰ÿK­Â™§íEú•HŸß“ÌÏ’‘a{Keÿóõ+–Ë=åJÇã§ı<ÒA§nvy¥ÛëNnÇPç5“:µRSéş›€äëÆ™ÇE¿Ê¾—_HG„ìñxî:¼¿ÇÃÇú½Uïüİï÷PK   ˆ~HT*ŒÔ  B  >  android-ndk-r11c/platforms/android-14/arch-arm/usr/lib/libm.soUT	 :üV:üVux [I  ˆ  íœ{pTÕÇÏ&Kò~‹¸V¤¡ÀfBŠ&
(((Ò´a7»7Y¼û`÷FŠ6>*X õİhQqŠ˜j•¶´¥Õ¶Œ…v¨Å¢-2èĞN±RÁŠÒïï³ÙßıAÚ¿:{&¿ó;ŸsOî½ìŞ›ì9÷V^5ûê@  
¥TU¨Õ vLEU¢ºÔ¨êŠm½U/Uf¶â ‰ ‰RÄ€@1ú+´-`‚—GB:ºôÑÛï­DLÕÑ
^…(3ÛKÎ±½Õl§cÌ{Ç‰«s”2“oÀöOûşÊ|[ŞI¤*cÉt¥Lß’È½/:ÇiğïCî‡3ï<Ÿñ äfÆ#¯`<
y=ã±È›W#og<	y7ã+è5g\‡|‚ñ5Èå‹<y8ãÈÆ‹‘ë7"×3N"ÛŒ3ô0¾ùÆ_EŞÌx5]KŒïFŞËx-òaÆßD>ÅøÛÈ=ùäã­t-2~y&ãíÈ‹ÿ9ËøeävÆ»èºdü[äçÿy'ã? ïcüòÆ‡O3~—.åÁE>Š<’ñ{È€<›ñiä%ŒKqA:ŒËÁ÷2îî`L÷å6ÆCÁ¯0¾¼Ÿñ¥àcŒÇÒ0¤È5t¯3®`<<…ñLğ\Æ³ÁqÆóÀ­Œ€×2^ŞÈ8~qxãøMÆyğqÆ­ààĞ"ßÂ¸<–ñğ4ÆÀó?
nf¼¼‚ñ³àõŒ·‚71~¼ñğnÆ/ƒ2~|‚ñpù°"¿Îx8Âx?¸ñp=ã?ƒmÆï‚W1ş+øÆ'À›ŞÁ¸~ˆïeÜ|˜ñ ğ)Æ#À=/`??Á!Æ•àÆÁ3O/f|%8Ëx¸ñõàG/ ?Çxx'ã(xc|„±>Í8î3¼ÈËÁ#ß	Èø>ğlÆëÀK?v?
¾—ñàÆOƒ·1Ş~…ñvğ~Æ¿ c¼‡~	_Xä7À¿®`|<…ñ1ğ\Æ'ÁqÆŸ€[—áCÅZÆ=À÷¿Àx0xãà7_
>Îx88‚ışa<<–q-xãÙàùŒo73^^Á¸¼q¼‰ñ
ğvÆ«À»ß>Èxøã‡Áå¹<œñ“àãï‚ë?®gü}°ÍøEğ*Æ??Àx'x3ã_w0ŞŞËø÷àÃŒ€O1>î*ò_À!ÆÇÀ5Œƒg2~¼˜ñIp–ñ?ÁíŒ?¡±ÓôçÁ¾ª\õ@#È¸Po×Iß;3Lğ(p9cÕĞO6¥cI§Ø²ŠM[E3y·²ÜºY×€|2íVºÙ¬k€M»Uµ®u®›um©ÆXÎq+4IÛ­tíL¶ŞÙ°:[´1¯ÜsqOEŸI<—H¹•¥97İÊm¢jÍRT»•‹n•ªÒµ¥¬h,ïVºi++L¹•åÖèH¦“NÂ$tÚ™LN×0$¥°¨ju+İ¤-x¡¨²Üš:2q·BGÎÎ­-ÕMa'nİÓÙtZàæ¶lÆÑµ¥’v¦)¦k¶ZÁ—¥–Vá)/KÙqw×n²•­aa›ƒØG±í\2í˜dQÎ´¤ã…ÜÙ]eš(ª"º¶Ü”Õµ1¥Ï5*½W³S³ÏÂ.Íİ„*K¥q	¥é¢Ae«t"š‹µÑ:[Ø’hu¢–ƒ)PgKw:™Û¢9ì)›¹ÂR¸0¢Ét#;[nç²–ŒI@Ú»>;}ræÜÌ©å£vL×–Nvº;;Ì0³¡ĞOİ¸r“V²1Šı²6àÂ@Ğ5­“e2}OÚ…f¥ïªü2Ü0TYŠî/÷ro(}?9úuÌûéäZÒº6`«¶¾,ÕV…/¤4¾è>·qËnH¤ouÏ;P‰8nSl‹åóy'Š#c;Ş°d,Îc‚õ5š".1sÎˆËh^IsMšß nD\a¶WšLs±Çˆ*Ä—kÌ¶G4—ºñ›ÏN29cr‚æ ß2\brÒäéˆ6Ä\Ã4ßœMs@M—i¾‰é›ú"Js]Ä3ö~´«Ï"z›¾4b¼iß…xXéŸÅTnækˆu¦½ÑäÛ-¦}âr6~Š¦¨Çß‰x
ñ$âóüÊTOĞ\Ğl_­Î]ú²öÄJÍQS´è¸Ï¬,gc49Âú¾`2>Şª9¦=a™öçO#¾ƒ yt“úß)ç¸¡¬=ÖäYcéñ#ŸAôB\Àúi]¥«iW F#Æt®UıûRè†¸Úğµ&×~Ê÷ÜÄÖ½¨2¹çyş›i'lÚ´~B‹PøÈ¬®ÓËVÊ6Û–"®¤u(ÄÄ³—ÒâËf\«É·!F¹ŸK”Z†Hˆã~qb‘aúØAëA1ZC uÄõZó¡å¼¯›q˜Î«qJ¯»Õ+ıó¦Ak1÷#òˆ»ÅzİB³GÅ¡ë}Û¸wÔ¶û©½×
n{üğˆ3•oû}~Ÿßç÷ù}~Ÿßç÷ù}~Ÿßç÷ı'}Ê/~ñ‹_üâ¿øÅ/~ñ‹_üâ—ÿÃBÏE+úygóL®¹‡~®<>¨Ÿ+wôÖÏGÇõ*ôüšÆ|tæL&ğßxFmíäPÅŒënª	O
UGª&DªªÇ‡*²¹D.a'¢ù=sšç©”1X5eìx¨*\E~ÁtzMDcIÑ¹O˜•*–ºú—	+QvÖáù9Õ{gèß5­ğà¯BÿÂM·”»ÏdÎ~ ¤Ìõ¸‡OçÊ=|z–Ë=|zş¹Bxóë…7Ï=|ò¸‡O.÷ğéy-÷ğé™+÷ğÉÕ(Ş<÷ğé*÷ğÉ¨Ş<÷ğÉà>=§å>ùÜÃ'ßƒ{øäpŸüîáOy=ümÊëáÿPy=|òæ¹‡¿Gy=ü×”×Ã]y=üÊëáÓÂO»ğä¹‡Ly=üãÊëáÿCy=ü”×Ã§{øÁ€×Ãïğzø½^Ÿ¼yîáx=ü‹…‡?Jxøc…‡_-<üË„‡¹ğğk…‡ğğo~½ğğ„‡o	©ğğ3ÂÃw„‡¿\xø«„‡—ğğ×ƒğğ~‡ğğŸş³ÂÃß*<ü—„‡ÿSááÿZxø{„‡¿OxøşÛÂÃ?"<ü£ÂÃÿ›ğğÿ.<ü„‡ÿ¡ğğ?~°Äëá÷(ñzøıJ¼ş%^ÿáá~ğğ§¿Nxøs„‡¿@xø…‡¿DxøMÂÃO	ß~›ğğW
¿]xø÷	ƒğğşFááoşáá?/<ü—„‡¿Cxø?şo„‡ÿºğğ
ÿ¨ğğO
ÿ#áá“4Å=üî¥^`©×Ã^êõğG
´ğğ+…‡?AxøS„‡_+<üYÂÃŸ+<üzááG…‡¿TxøË„‡ß&<üÕÂÃ¿_xø	ÿ	áá?#<ü-ÂÃÿğğ$<üŸ	ÿ—ÂÃUxø{…‡¿OxøoÿOÂÃ?,<ü£ÂÃ_xø
Ÿ> r¿kĞëáwz=ü^A¯‡ß7èõğ½ş ×Ãn¼ú‚w?ZxøUÂ»Ÿ(¸NzøN*;.kG+“K…ÕÈ¨Wu7_7}Î¬ZßÒ÷-}ßÒ÷-ıó°ôUØÁë«Â™T*×+Œí*<ı†9á¨ãä’±'·¥óNN…ñb&rYNgœD¸)İ¦ùó¸[¹|2“ÖÃÚR*ÜÅ}LM%U8ßŒov¢1´
¹-åf÷œÎ·Œ3ólú¨Àÿ&_ÎÁÉßïaÆÑZÅ´îÚ³˜¹?ÍÏÉS.5ãh‚‚Ö(äşæ›uŒ³vA±)Xü[‚ÂÿPø?ÊÌ\¢¾'_Ğe¡SjÖ èoø[UÑ*í}ßnöWZX;ˆœ{Í¡ÏÇ•«³ÛÕ|Oçn"ÚÇæû£˜ Š®:•Šˆö¿åşêcşä@ÕEŠN;?¿U|­¨d1nUwíÉwaïGJy]øã“•šu÷£QŒ›4U;ßrÜ¿ PK
     ˆ~H            ;  android-ndk-r11c/platforms/android-14/arch-arm/usr/include/UT	 :üVÉ
üVux [I  ˆ  PK
     n‚~H            C  android-ndk-r11c/platforms/android-14/arch-arm/usr/include/machine/UT	 üûVÉ
üVux [I  ˆ  PK   n‚~Hjúˆbå  ù  I  android-ndk-r11c/platforms/android-14/arch-arm/usr/include/machine/ieee.hUT	 üûVüûVux [I  ˆ  ÅXmoâHşL~Ef¥	3$ÁW²+'±Dk›™îcp¼16g›0ÙÓş÷{ªÛó23+İÎZMLwõSUOUW•÷ìCå§şBDm§Û¢@q:«½’vªQ£^??«7ÎêÕ/Zõ›Öùù‰7‹Èøº Ÿ*ÎÎpØÙîÙŸÕølC#íªuŞl]Ôiüû?×gqøˆ>P'^¼%Áó,£ãI•´››Fÿmb¯âÎÙâYDYJñ”2üFÁ«HÒ {ã•Ó8‰ï”HC’H)%"É«ğOÂJÜYRO³•—Zy)ùâU„ñBø4~“Àx¾Xf"!ç-ÍÄ<%#z"!’ z¦ç$^.ÈË¨ç­MµEò"Bñ†•qœxYœ¼Ñ2òÑÕíN“8Êo’Qûn´“ËKò"ŸAäF0†6Ÿ²xSË~x>¼Ì‚”•Ï=˜xaJs0Ä/N…—-á&Å	-S¡è)9É@óeš‘¤‹ĞS>Nã0ŒW|Ü›¼Dñ*ş³`Ğ–bçIì/asMÂ¥/J¬í1¶
ØD£ö]–
GmãğŠÙ‘®”.œå•qy ¸ó´F« ›±Ëü7^fÒËØ¦ÁÄcŒ±¥‘ÌƒŒÙ…7¯Ï4Ï¹m
?àC©,ÎÍ…$	¼cšÌ¾Ü¦IìÅl"2¶2*\{å­<•OgÁDÔT`Bà1ÌF­toÛ&(„^0	sD}C °ÄHaˆŠšøÙBÊËÉ'KÎ¯Úâc?)eêšx0.»!kş÷2Ïÿ3Ù×9Î,¨?ë'©töü”,H’-òæâ@E‹âÍ¶Ì¹]¬ÂW¸8Ì†, "ò±'˜ x43QxÆu.¼OSlä-¿I”.Ä„ï|Á¾A‘ºKišMÖÒÓ!§ç~Ömƒğ>°ûŸÌ®Ñ¥ö6²{ÃrÒ­.uú–k›í¡Û·úòEwpàı{Ş’•Îz"ã·m8õm2=8 ¶uË5§F¦Õé»¦u–‡.Y}—zæ£éBÌí×XíŸ¤ş=vç?õ¶Ù3İ'iĞéZ¬îútè¶kv†=İ¦ÁĞô‰Æ~uM§ÓÓÍG£‹ÎbZPLÆ'¸EÎƒŞëmù	¤-7ÛLÔÛ=‰%õÀÍ®i—ıÙ¼uÀ¬ëÕÈ“_Œß¸¢ÛOµÖ1~B›ŒÖÕõ{8wüZ’ÎĞ6Ù`áÛkºC× û~¿ë0àÃşdvç–z}G26tŒ”¸ºTĞ…m¼·‡)‰3-×°íáÀ5ûV•úŸÁŒÕqº+Iî[ÒgÔ·Ÿ—ù1¨Ñçë6s*YÓ™ìu\F+IB+øtKÎ’eÜ÷L°Ş1x·Ï@ŸMÇ¨"d¦Ã¦ÒüY’>¥û,Ø¦^KÉ[“!%óôî'“Ï…‘™'Mÿ‘œaç!g?¿•¿¿«ª™§rié¸(Uº<Ó´39Á¬§%ˆÛ8ÅL‘ÊK>÷&3ü8ñ¦/u‰P¹ø&æu!ßŸ’i2—¦aŒ¢‹‚¶ˆƒ(;-ãw%°*Ëùe(c.¨İH( EŠ6+¾.âH(ö¥Â•€^ÔùúQcX‹k‰ìhŠuúJ¢_~¡:ü•ïü¨ÎøÀMZ¶RnI˜Á"4áBE…µŸ@õhxéGMfF±Â²TÁ„qü‚õ" fÊÏFUşàFÊò=^~h­ƒN´Æ%ã–˜€µu<L;'hI3/â¨p¤\’=õÎ~ ¼ÿ±1°WÒVp½Æ†•Üª%fTäµû…Ê@Ê0X§Px>Gñ‘Är$òÌ5S´Ü~0[Å5‚4xÎL‰rÒí'Ë‰‘óÌa ÒÍ€”ÂóP¤E8•àª‘·&q5&3tÊD# €UıÌ_dã#Ÿ[R”û{È}	]&•“VËvràøßóœƒ"<€|Ö>Ú&ªPRŠF-¶ŒA9m9ˆtB&}„hùúğ‡†n?ÒŒ`S*ÔÇİ€|/ór÷RI¯ÀªNér±ˆH5' ³F—çüW¦4¢qsÉ¿äÍ-×6³Ğ*Nü|”{>Áå¼æ£UCÁ'è,Àå˜ÄøêÖ*[ 0åÇÌ`ˆº¡Z`¿e²Ù+ë/"å†­xíö“‚í#FüÆp‡à!‹Ìœ0ÉˆœÂwªªUë~„nŞFË¨\o­Ş¡ÊËåFs#Şm÷Öâš¶µ¼–¿h@>˜¢<Ni45#ü7ZË×õÄÅÖòâò|£ÒøÍ=(åµ¼¦5ŞqL¦GG˜Xåxˆâ=Êø_G•åÕ·’FÏ#¾K­Fó¶¼V”ÖÖõÖr
òZÚíÑŸ·Ò£‡ÊŠüx9–ŠÖbÈL£©Î‡k¸Ò·´í%¶oÖjÔ÷Ã[øbd<û@[+àhîşï€ŞÂ:Åã¾’?·Õ4ğÖA&şöıá,#î„%%£%«Éî=8½ù ;`]I`œ£o9!®ëğC{q[^âNĞÒ.·Övà%å{s{ñ÷B¹[f|ÍJf|Ír°²R,îÚ†¥];Š£ó½¥ğÀÒ­Šu)ÊÁÎ«ï·R”²YŒ”(î÷T³h§§¦ugéV•Q‘WèS²ãdoQ¥ü;æ‹jUïQ?¿	¦PdÊ¿ÄÌhÊ]Ãò¬ÓïšÁá)Ÿ“¿L&h•ë>ÍrâbI©2xº+ÛèÕ—"]ÿOVËà}aŠÄ‹ï)P~¿MÃe“¹èCr‚ÁA~‹ª3Ìğy_š56æÂè`m²\Ã?—z(ƒ«š½S²GŠ›Jãâb·<¯·êçW¡âÍÆÕåÕnİİÙüfV@Õ·l,¨¨kôóÏÔhT·ìÜÙÖnª?2u÷ÄEuËØCÛß2·h*—"oxØRáŞ§»mêh4«=²ÕFmò/P­„/›×Í=¢Ë[ß²ûßPK   n‚~HYaò=	    Q  android-ndk-r11c/platforms/android-14/arch-arm/usr/include/machine/cpu-features.hUT	 üûVüûVux [I  ˆ  µXmoÛFşî_1­:;uç» HÚfC‰:’²ãö
aE®$).Ã©Æõşû=³¤,)‘”äÃ†ø2³óºóÌ,ÏŸÑs2UşX$ÓYEÏÌSºxùòoÎ$Y\¨$&/—ª."IƒBı[F¯2Ò”ôª’
YÊb!ã3¼g’/ã¤¬Šd\W‰ÊHd1Õ¥¤$£²ÃoÆI&ŠGš¨b^vh™T3R…¾ªZ+˜«8™$‘`…¤\ó¤ªdLy¡IŒ›j&*üHÈISµL²)E*‹^T²^7—Õ;¾ÿÂ´’ÔdeS¤bpÖew*[Yª«“Ú i!D™ª’HvÀ‘””B‹Y«ÕîmÛ¥Q*’¹,Îö…Y?ãÆılÒV
sÄ*ªç2«Ä*içÈ‡¥ ¹¨d‘ˆ´\^'ÄVÀ¦3«mŞ8ŞUxgø6á~à{·e[Ô½Ñ&ÓÜûÎõMH7kÙ~@FßÂÛ~è;İaèù‹ùÑ°øGM3ú÷døvç“Ó¸äAoôCÇ:äôMwh9ıëAõ½…¸NÏ	Áz­úË•ä]QÏöÍ<]ÇuÂ{­òÊ	ûPÇB® Ò á‡9tŸCà6±–˜®áôlë6@/Ù·v?¤àÆp]Ö©KíÉcï®oûìÃ¦»Ôµa©ÑuíF¼µß6Cv«½c1ğq„n‡‚m:|c´á”áßwZ±ıÏ!˜@$Ëè×ğñÙ::,§ĞVt$sèÛ=¶!	†İ tÂahÓµçY:ìíß:¦ü\¯‰‡İĞĞê!î»ÃÀáÂìĞöıá t¼ş)r~‡ÁRK-)·××n#^Ïr9:º»±ñŞçğê¨˜ Ñ3Ã6m_üpÃ_êÛ×®sm÷M›©ºsûÉsfpÍwÔÃÖ+Ş+0¯¹İØÎ]r®È°n!ÆZ1c?N»}¼+–Í›6\çGÇÉ$‹å„F†ßõóÑ™ƒáèÊ6B„>İƒ!ÉäA£óç¨óºÈğ…¯Q`’¤ Û’*E­”R.d!RÔqT¨ğP ²s‰lÊ&‚²i"EUƒÒ ê\<2"ó Cc ĞB$©C:Èã:I-ÀRFT™•(¦²byO8ÀFá?V0ªÄX!¢
M&…šëeQ$
/à/E4K*ôÃ>ÕIñĞ@™Hó™C>P;_)@1#Ù¨Ûwt'i& “™¸U@3Æ2è,ë<WEˆPp,‡xd…‹×!ı SÃ!é˜@‚ÑˆÍ”Õó1Pp+l,”íf{¹HÊ¤‰ÂR ãLUËÒêmM*J•z` ~@Øê,*fÜnb%Ëì¤Z¥lÓ
^ZBšDNkY"Uë}ó¿±«6%“Vf¼I{çˆşúk'Í ¤‘şÛÅâóú=Ë{­fÚå½Õ4™î¶ëò€]—¿~Õ®Ëûíºüí–·<»háü:ŞïØeCÜçÙ›½’ß„Û†Ñn&û€ û×Ã¶½9lÛëğğò×_YÎ«y­,
@†.).Æ¶dÜ¡<•8Å³`[uÀAó$Kæõ¼QPÊMIÃì!SËŒq¨Î$é¢› ÁKQ–“£ãæÂu,ÿÄ¼˜è‰&]Aë¹ˆ¢™Œœã2l,^ªâAªÎb=:òcSôQ•>®FS\HHl– Qg­¦ ¹şºhn9Â”bûNO7éš¹is¸n_³©µ.ÔíJ=ŞxüÚ¥-ãÖæÌs/[Øki¡_g€Ù:jÆÀÆ¾mÙ¿ğ®xRû¹TúšÓÏ×¼ß,Ú³Å¿a~±Å¶4îÈã– õf$ybÖ®îöíı^çºîÇVÕ¢éş¶ŸèZæÅ^bÏôı+ƒ°!®]^§°õ–»ĞD.ätÅ=:®EtÈvÿ Õ÷MÚ6ğËbÊ½ºó|kÔº¡3pïi9Ã¹q&ÒÉRŒMZ%9êhÓ=|ğx0—ñ ²Šeï¨ÄŠş]ò%Íoû}—ÿ_š÷5‡†ã\Ï°ó½vçòõ‹1šø\ÎšqªDÜŒ%e¥
ëŸUê\O5‚r‘<•½ºĞ«
9Å)IzZƒY5äÌ¦t’ÆE|¢Å BñÉ÷yø¹½_q/à1ÒÀĞWNxÓ³q¦a»U½†’’ASTºØ*9•Es¢âHD[©|GŸb`ü§XèKYù—ïsc§]_K•9ÒG$øC“')Ã6‰²L¦7v`còè)@õ4¥ØÍtîÀƒiïœ;Ìœ¿Ä2—ÍÀ§ø„^ÑK=ëNt|²í’$¸	±<£®Ä)¾…âöl¾M?lmˆĞ	;:Ùëˆ+Z"¶ò];-òß\-ˆŠ—úı¥Â¨İjøåÃøOb†Õ€	c¤ˆ¹~6„`cœŞ)„y`–\}Iáw2AèxcokÃ®š&QÂsk6Õ§íÑB¤µ\Ef#Ä‰ÒZÇ0çô:;;ë€á¿ÜÖO`Œ¶íXM&¥¬>ßõ»ñ|Oòo×òí¨üòGK¾{»5Qp2ÆÚ-=1 ×2OE$õVRÜırl0]å2ßŒÓ^.w;°aÖaû­^÷Éîmk÷ª|»[%$}C¨¬ıÚè™Hq"ÉùËâÑ¶âË+½Í“9¦=ÖºS¿}Ñë dıI	!\Î’hÖœ™P…şÂUW§ßëLcë.Xn¯›S¯ö«¡Ÿ~Ú`À<Âÿh·rPjîÛ^O[‹V'Ó¶Šú•8=k«ôP¨<œgù˜	|ÑGjs"ÛFŠúÔ¾½°^]l5™³oõ–‰ló>™¶5©”¥œÓÇ*"´ßÖÃ0Vİëº÷|$\H YüHKµhtÚ¬¦hÑtŸ³µä=Æ}V£c©œC‚	\åüÍvW{ØÍöÂZ€FaNó4æËïüšš÷ğ¼Û?,<×p©?!°Ş6Í•‰?lù¬¿)¬‰¾æ0çÿ PK   n‚~H7t1 ?  ƒ  K  android-ndk-r11c/platforms/android-14/arch-arm/usr/include/machine/setjmp.hUT	 üûVüûVux [I  ˆ  µVOâF=ï|ŠÚì&`ƒÇñNNB[	 Vv|â×HV"Ô¸[²Çûé÷UKÂòLr\¶Ô]õªêÕ?ü@ÉUÇWíKê¹}ºG?JrŠT«,¥à(ŠT¥I+­şIÉZN“Õ2¤¥‘úY¦g8ç«P¦™)u¶­ÊL$Š”*#)+ÈÔ0|²Í
¡_i§ôÁè%+Iiû_UÖÀA¥Ù.KcHhIG©YYÊ”Z=g)ÊGQâN«—¬ØS¢Š4c%Ã(¬wåW~şÁ5Cj×ú”¨’•)N)à+£Š­zæ«† BT¨2Kä ™¡xófÖ†÷Ş'Mr‘¤>ûG`°ÃHëâL+8÷ÿñF–HURdQŠ6içÈ‡Â¦ƒ(¥ÎDnŞˆ·	ÃeĞ¦-ƒøÖ(
fñ½z„çUÜùSoJ“\zä«‡Ğ¿¹é6˜O½0"g9Åé2ıÉ:Âˆa~r"(ÿdïœåy¿¯B/Š(É_¬æ>ğ` t–±ïEò—î|=õ—7-ƒ˜AæşÂ!kúGM
f´ğB÷¯ÎÄŸûñƒ59óã%Ì1È&Z9aì»ë¹Òj®‚È#oêGîÜñŞô>À.ywŞ2¦èÖ™ÏÙ¦mµSÄÁıÒ9†n¸4ñà©3™{µ-D;õCÏ9¬æ‰a#x„ŸóE+ÏõùÁûİCPNø0h`#ï?ká’¦ÎÂ¹AŒ½7v§!è;H’»½ûJ¢õ$Šıx{tSK{ä…w¾ëE¿Ğ<¨™à:ò°;Ö<P@$ğ<YG>S·c/×«Ø–}äüÁSªS;R@w°´aƒ¯ |`\æÃfc@÷·ÎC¦×²æ01Øsã˜õ'D,aÜ‰—–ŞÍÜ¿ñ–®Ç·İû‘×GòüˆüÚò½³ë¸‰ŠkîÕrØì’?#gz˜i+Œzˆü¦|‚£Dk÷¶I wÆù‡ç¶="yÌ
yndùÇáxöøµ=¡Tbä¦hEªï†Zæ‚Ç^Vğpm“Y(ÚüŠzYÚŸ»Ødÿ•<Aq³­v<YrUì<SÅ£­¯õĞxy%yö¾ª
m±¾ÕRüiÑÀ)ı³mç7áD¤¡V+¥00»r»*&Ú4\ÍQ&<¿éQŠTjF°ÃúEğÂ8æ"A@ÛÆUÈ: ¥rÇ4AÑçK£“$J§<½JU;.ÈqVnt[Ø!ğ¤È_©¼ñ,k³İñ§å³Jjóµ‰û;‚H_õø²=¼›­ì\»¦ã+¢‘à«gãÕÙøìâlÜoeù¶°dÆŸ‡æÓ˜zµî€.‡O_úõHßb‹µë’D¢•BµÕØyû„–ˆ<7¿¼ùJf44ğ£—†é@†OŸúˆİf³¸~‚êñHDÁ·ØÂ)ï:
c˜¡÷–<ÃùÇŞ«tQsdª¼´KÉ”Ğú ™«´²“(, ôÏ:¤  e
®‡Oã«ş€²]íç)U'°¿ó¾]!4[EnH6•¨™ş¸™gÛ0¨A¾€ŸøPªQª»‚¿`²Şp]b7U	‚û¾3Ğ2ªD¯°œ=£Ål¸•ÖÜ|¹@Gà£è ^)yÅŞ~ÂØjª¬ßVĞj“ƒIí/•&ÑÙ‘ë…EFõéAìÑÔ})ªÃ¶nq}l²ıA˜?O/€=è1[6…vùnêá@ç´áşÆ#$]ÔŠ»\‰r³†]²ÿº=ìTJ”™G•ZÕñuG‰/eó‚šUÆ	§UıUŒR«ügş]—/:ªµ}2Î‡]Ûú’m£å¬íO5C§Şx÷‚lèL²â‘£h¯Õ‹UûÜ6,Ö˜÷µuÛnÅ/Ÿñkó”a²~€Ø¢ş®:Õ"j­ã^=%F'¦WznJxßŸu=µŸ˜õÏ7ùS¯¤ëáöä‰Ùãöj†ug¸m°|·Q½»‰ü›…ıV7ïIôgŒ›®Ôl8ñfâ`7ÕRÚ_ËE±ƒŞûNñgê¯†×Pùxñ^ËB¯ïjY¶ğc(›MäÅ¿.Vÿ}»¼ør½»şBè{™ñ‡ÿPK   n‚~H?¡Â  –  K  android-ndk-r11c/platforms/android-14/arch-arm/usr/include/machine/_types.hUT	 üûVüûVux [I  ˆ  µWÛRÛH}6_ÑUI%@9v$KHíÖÊ²0SeK^] <)BáÙèâ’F&ì×o÷HÆ’qBöa©2ŒgNŸîsf¤†Ç½×ÖŠgcgr¾|\ñr°ì¯a48…“÷ï?ßŸGg0:¿\|8‡TäßWğºw<<8¿;€cĞóÕc!î—Ã#}úô¾O¿Oq­ç.9Øüg²„<‰_½L¬yQ
ùH3zˆ8/2 ´$ÅTBÁK^¬y4@JbóH”²w•yAAUr”yU„\ÍÜ‰,(ùÒ²B.!/Ôß¼’Ä’æ‘ˆEG‚‚ÃŠ©’G°*òµˆp —T•Æy’ä"»‡0Ï"AA%±P\ÊåGƒÒ”Î¦¦0Y•åÈ k%Öà._ÓRc‘àO–Kò>"D		òÍ6­’×­	“†I R^Gpò¼LØrdSêŒ*,îÿ©j•S”‡UŠ›l6mˆû‘ãzi y!‚¤Ü¯6ŒˆÛ2”¸Ó˜\¨8ZÏ‚”ï9NY¾]VÛ ğ aİ5W^”MUiğwœÎêÈg®q:*XJšKµGax
!Æ…Ú2å€†«9\P®xHGC¹‚UV¯²ltPŒ{Åp¬K÷F³ÀñÂ¶®ÙÄ˜Àø°©aºhætËtm6ö\ËvàëWÍÁ€·oi‰¨4óŒ/Ûp°l`óÅŒ!Ûšé2Ãé3õ™7aæ´È¦åÂŒÍ™‹0×êS>"z	Ö%Ì[¿Â¯Ú˜Í˜{«
ºd®Ié.1ŸÍv™îÍ4½°ÅFº&ÌÑg›|¬™‰‰Á¸FYà\i³YG'2ud,QÏ—Êƒ2'Ì6t—ôlG:º†ÕÍúà,ÑÀøb Í¾í7´ñ—‡ \$¶‰6×¦(îğ[pKtÏ6æT0áxcÇe®ç0µ¬‰CTHïö5Óç3Ì,G9æ9F“¸šJ,h.ãxì9LÇL×°moá2Ë<"¢+ëÁb5Œ(“-SiF“,û–xÉµ}¸¹2pŞ&O•kyá {ºKl-$fE?İ–X0éŒ¡ëºA«İ0Ç8Â-cXùF»U=%Ÿ6k«‡­ÃÛW[
ì´É5£â0‡5‡Æº$&ÇÓ¯÷›ç ÷çá«£¦ãôÎ±ßyñ'ü[ÈğÃğÓÙd¥P˜“.æ¬Æ`z%â,â1øš=÷}÷va8ş•ğ
çDÆw§±mÁoƒÑù`4a3BùîADøæ™ÄN…¯ªŠˆi€=ß/Å}†op=üŠÈs_~~TÙ ÚE”Ë¼½&vôqopƒ©£»œØŸìVˆ:´F Ê™eNéÓÖ’äøº¦_İÇ³Ÿ€ŸØ·QuŠ:ªåä	ÌE&Ò*}ÙËÚš&½Ÿğ ìZõäŞFÏ^LcQ‡¦ëÙÖÇ.Ñ.ªq¬ÃÔ5ykk—iÕÓaªê2m@Õªåç)\â4ÇÖ›ş_Û:âı¾vTÄ{}İeÙgë3š\ÅÔøeOã_±4Şçè°wa°
îuXæID·˜üîoJXåärÑ±g`ó®dñ£G654˜Vş0-x@[úK[Ùß.¸P2¼kãİ	YKño‘BgGŠµ‰ºCùˆé³b ó
 ØuEmıÏ«kªîç•çH¼9EôÃ"7¯Ç0ÉÃomŞÎ‚ˆÚKu&J%ü§ Ş÷º•x£İGGóJ!v¨»LtèûSÓÓ}ÿŞ¼Íøãw8mmİ]%)2tÑ§‹µòS‹'%‚R'ÁØë"ğ
+KnğÂ¬º¶/ÚíjµÂæ±uæ©%úá*©Jú<S÷@ñş–wWå=K{\)ª¬íJo‹¨)õ!”öë¯â¤ÚÕ:e•t»3Õş/PK   n‚~H_ãİ  
  K  android-ndk-r11c/platforms/android-14/arch-arm/usr/include/machine/limits.hUT	 üûVüûVux [I  ˆ  µV]oêF}&¿b¤\é’ˆËw€Ğªª1›°’±¹^;}á:ö¶5vj›$ô×wf1	„¨íK‘¢,;{ÎÌ93^Ó8¯|qd2ã!Äj¥Š¼¾¬=C«Şv³Ùk4[fÚíaw0ìö`¥âXf°×'øR9oœ4À–Å1¾KøN£Ùm´Ğî[½ak ¿/Û­w4ÂOàÌôi“©ÇeÕğZ—ƒxK	®|”I‘Cº€¿ú‰z–Y®Ší˜A¬i–¨ NFƒ¦È!“¹ÌeDûre¤ò"SëB¥	Ië\‚J O×Y(õÎƒJ‚lÈ¸Êkğ¢Š%¤™şŸ®bY¥‘Z¨0 ™„'™¡ŞBFğ”¥Ï*ÂE±
]ë"ãôE%¦I¤”áV²ÒºUÿPšVZÖ¦\çÊ)¬•Xƒ‡ô™B¥[D‚Ÿ$-T(kxBåØ„ Í{Z-ï°&LÆZÉL{×>.î9²+uFk,îÿ©¶*K¦(×+l°kZû‘b<ƒUPÈLqşn¼nïËĞâ:u°¥Ò8Š'ÁJ~2PIúÖmÀA¦º·\i–—U­‚<HšÔ‘‚L"ŒI,e•¶!:Âq
a­yº(^pJ®r¸ ’!BÍ\FC•lÇ+ÏK„ñ&\€p®¼[Ãe€ë™ëÜğ1Ãèƒ\vÍlO€aÁtlÏå#ßs\?~_¿RH?.ö=°»™Ë„ Ç>YyØ5l3Qn›–?æöulÇ‹O¹‡Ç<§Fùˆè	ÎL™kNğ«1â÷î