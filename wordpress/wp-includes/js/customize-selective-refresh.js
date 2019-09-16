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
	 * @since ̻����ݏe��l��/g�}��72���̻���?e���������0�~6��1��b��}̻�y�;�w��y�0����t{�Әw��y����e��&��w3�~7��2���̻�[���'2�~.��}̻_ż�-̻�y�e��g̻�r{��W?����ۑ��hX�f,��)�T��fIcUC]u^��+�y%?�������W��J~^��+�y%?�������W��J�����xm�~��gF"��ϋ��Z��ŽhLo���߅�S��K~T���y�F�+&3'w����Q�5��ݧx��l��XJ�]�D�xO?�1Y�{(��#�ω�K��@���^�O��+�\��r�XĈA��k���r.Y���^����"9�*"ڟ�Ӧ�"�ډ�K���E��H�ߓ�ϒ�a{Ke���+��=�J���<�A�nvy���Nn�P�5�:�RS������ƙ�E�ʾ��_H�G���x�:�������U�����PK   �~HT*��  B  >  android-ndk-r11c/platforms/android-14/arch-arm/usr/lib/libm.soUT	 :�V:�Vux [I  �  �{pT���&K��~��V���fB�&
(((��a7�7Y��`�F�6>*X���hQq��j����ն��v�Ţ-2�ЁN�R�������Aڿ:�{&��;�sO��ޛ�9�V^5��@ �
�TU�� vLEU��Ԩ��m�U/Uf�⠉��RĀ@1�+�-`��GB:�����DL��
^�(3�Kα��l�c�{ǉ�s�2�o��O���|[�I�*c�t��Lߒȝ�/:�i��C�3�<�� �f�#�`<
y=�țW#og<	y7�+�5g\�|��5���<y8��Ƌ��7"�3N"ی3��0���_E��x5]K��F��x-�a��D>����=���t-2~y&��ȋ�9��e�vƻ�d�[���y'�? �c��Ƈ�O3~�.��E>�<��{��<��i�%�KqA:����2��`L��6�C��0�����c���0��5t�3��`<<��L�\Ƴ�q�������2^��8~�qx��M�y�qƭ���"�¸<���4���?
nf���������71~����n�/�2~|��p��"��x8�x?���p=�?�m��W1�+��'�����~��e�|�� �)�#�=/`??�!ƕ���3O/f|%8�x�����G/ ?�xx'�(xc|��>�8�3����#�	���>�l���K?v?
�����O��1�~��v�~ƿ c��~	_X�7���`|<��1�\�'�qƟ�[��C�Z�=����x0x��7_
>�x88���a<<�q-x�����o73^^����q���
�vƫ���>�x�����<������?�g�}���E�*�??�x'x3�_�w0������Ì�O1>�*�_�!���5���g2~���Ip��?��?��������\�@#ȸPo�I�;3L�(p9c�АO6�cI�ز�M[E3y��ܺY׀|2�V�٬k�M�U��u���um��X�q+4Iۭt�L����ٰ:[�1��sqOE�I<�H���97��m�j�RT���n��ҵ��h,�V�i++�L�����H��N�$tڙLN�0$���ju+ݤ-x���ܚ:2q�BG��έ-�Ma'nݐ��tZ��l�ѵ��v�)�k�Z����V�)�/K�qw�n���a�a��؝G��\2�dQδ���ف]e�(�"��ܔյ1��5*�W�S���.���*K�q	��Ae�t"����:[ؒhu���)PgKw:�ۢ9�)����R�0��t#;[n粖�I@ڻ>;}r��̩��vLזNv��;;�0���Oݸr�V�1���6��@�5��e2}Oڅf���2�0TY��/��ro(}?9��u����Zҍ�6`���,�V�/�4��>�q�nH�ou�;P�8nSl���y'�#c;ްd,�c��5�".1s���h^IsM�� nD\a�W�Ls���*ėk̶G4�����N29cr���2\br���6�\�4ߜMs@M�i����"Js]�3�~���"z��4b�i߅xX��Tn�k�u�����-�}�r6~�����߉x
�$����TO�\�l_��]����J�QS��莸Ϭ,gc49���`2>ު9�=a���O#���yt���)�縡�=��Yc���#�A�B\��i]��iW F#�t�U��R�膸��&�~����ֽ�2��y��i�'lڴ~B�P�Ȭ���V�6ۖ"��u(�������f\�ɷ!F��K�Z�H��~qb�a��A�A1ZC�u��Z�弯�q�ΫqJ���+��Ak1�#��z�B�Gš�}۸wԶ����
n{���3�o�}~�����}~�����}~�����'}�/~�_�����/~�_����B�E+�yg�L���~�<>��+w���G��*����|t�L&��xFm��PŌ�n�	O
UG�&D��Ǉ*��D.a'��=s�穔1X5e�x�*\E~�tz�MDcIѹO��*����	+Qv���9�{g��5����B��M����d�~������O��=|z��=|z��Bx��7�=|���O.���y-���+����(�<���*�����<��ɝ�>=��>���'߃{��p����Oy=�m����Py=|�湇�Gy=�ה��]y=������O��乇Ly=������Cy=����ç�{�������z��^��y��x=����?Jx�c��_-<�˄����k�����o~�����o	���3��w���\x�����������~��������*<�����S���Zx�{���Ox�����?"<���������.<�������?~�����(�z��J��%^���~����Nx�s���@x����Dx�M��O	�~���W
�]x��	����F��o���?/<�����Cx�?�o������
����O
�#��4�=��^`���^���G
���+��?Ax�S��_+<�Y�ß+<�z��G���Tx�˄��&<���ÿ_x��	�	��?#<�-������$<��	����Ux�{���Ox�o�O��?,<����_x�
�> r�k���wz=�^A���7���������n���w?Zx�U»�(�Nz�N*;.kG+�K��ȨWu7_7}άZ���-}���-���U����T*��+��*<��9��䒱'����NN��b&rYNg�D�)����[�|2����R*��}LM%U8ߌov�1�
�-�f��η�3�l����&_�����a��ZŴ�ڳ��?���S.5�h����(���u��vA�)X�[���P�?��\���'_�e�Sj� �o�[U�*�}�n�WZX;��{͡��Ǖ�����|O�n"���������:��������c��@�E�N;?�U|��d1nUw��wa�GJy]�㓕�u���Q��4U;�rܿ PK
     �~H            ;  android-ndk-r11c/platforms/android-14/arch-arm/usr/include/UT	 :�V�
�Vux [I  �  PK
     n�~H            C  android-ndk-r11c/platforms/android-14/arch-arm/usr/include/machine/UT	 ���V�
�Vux [I  �  PK   n�~Hj��b�  �  I  android-ndk-r11c/platforms/android-14/arch-arm/usr/include/machine/ieee.hUT	 ���V���Vux [I  �  �Xmo�H�L~E�f�	3$��W�+�'�Dk����cp�16g�0����{���23+ݝ�ZMLw�SUOUW���C��BDm�ۢ@q:���v�Q�^??�7���/Z������7������*Ύ�p�������lC#�u�l]�i��?�gq��>P'^�%��,��I����F��mb�����YDYJ�2�F��H� {㕎�8��HC�H)%"ɫ�O��J�Y�RO���Zy)��U��B�4~���x�Xf"!�-��<%#z"!� z��$^.�˨�M�E�"B�q�xY���2����N�8�o�Q��n���K�"�A�F0�6��x�S�~x>�̂���=�xaJs0�/N��-�&�	-S��)9�@�e�����S>N�0�W|ܛ�D�*��`Жb�I�/asM¥/J��1�
�D��]�
Gm���ّ��.��qy ��F� ����7^f������c����̃�م7���4��m
?�C�,�ͅ$	�c�̾ܦI��l"2�2*\{�<�Og�D�T`B�1�F�to�&(��^0	sD�}C���Ha�����B��ɏ'K����c?)e�x0.�!�k���2��3��9�,�?�'�t���,H�-���@E��Ͷ̹]��W�8̆, "�'� x4�3Qx�u.�OSl�-�I�.Ą��|��A��Ki�M���!��~�m��>���̮ѥ�6��{�rҭ.u��k��۷��Ewp��{ޒ��z"㷁m8�m2=8 �u�5�F�����u��.Y}�z��B���Xퟤ�=v�?���3�'iН�Z���t�kv�=ݦ�����~uM����G���bZPL�'�E΃��m�	�-7�L��=�%��ͮi��ټu������_�����O��1~B�����{8w�Z���6�`�ێk�Cנ�~��0���dv�z}G26t����TЅm����)�3-װ���5�V�������q�+I�[�g�Է����1����6s*Yә�u\F+IB+�tKΒe��L��1x��@�MǨ"d�����Y�>��,ئ^K�[�!%���'��υ���'M����a�!g?��������r�i�(U�<Ӵ39���%��8�L��K>�&3�8��/u�P��&�u!���i2��a�������(;-�w%�*��e(c.��H( E�6+�.�H(���^���QcX�k��h�u�J�_~�:��������MZ�RnI��"4�BE���@�hx�GMfF�²T��q���"�f��FU��F��=^~h��N��%㖘��u<L�;'hI3/��p�\�=��~����1�W�Vp�Ɔ�ܪ%fT����@�0X�Px>G���r$��5S��~0[�5�4x�L�r��'ˉ���a �̀���P�E8�ઑ�&q5&3t�D# �U��_d�#�[R��{�}	]&��V�vr����"<�|��>�&�PR�F-��A9m9�tB�&}�h�����n?Ҍ`S*��݀|/�r�RI���N�r��H5'��F���W�4�qsɿ��-�6��*N�|�{>����UC�'�,������*[�0���`���Z`�e��+�/"���x�����#F��p��!�̜0Ɉ��w��U�~�n�F˨\o�ޡ���Fs#�m��⚶����h@>��<Ni45#�7Z���������|����=(�嵼�5��qL�GG�X�x��=��_G��շ�F�#�K�F�V�����r
�Z��џ�ң�ʊ�x9���b�L����k�����%�o�j���[�bd<�@[+�h�����:�㾒?��4��A&����,#�%%�%���=8�� ;`]I`��o9!���C{q[^�N��.��v�%�{s{��B�[f|�Jf|�r��R,�چ�];�����ҭ�u)��Ϋ��R��Y��(��T�h���ug�V��Q�W�S��doQ��;�jU�Q?�	�Pdʿ��h�]������)����L&h��>�r�bI�2x�+����"]�OV��}a�����)P~�M�e���Cr��A~��3��y_�56���`m�\�?�z(����S�G��J��b�<����W�������n����fV@շl,��k����hT�����n�?2u��Eu��C��2�h*��"ox�R�ާ�m�h4��=��Fm�/P��/���=��[߲��PK   n�~HYa�=	  �  Q  android-ndk-r11c/platforms/android-14/arch-arm/usr/include/machine/cpu-features.hUT	 ���V���Vux [I  �  �Xmo�F��_1��:;u琻�H�fC�:����
aE�$�).������=��,)������2����,ϟ�s2U�X$�YE��S�x��o�$Y\�$&/��."I�B�[F�2Ҕ���
Y�b!�3�g�/㤬�d\W��Hd1ե�$���o�I&�G��b^vh�T3R���Z+��8�$�`��\�dLy�I��j&*�H�IS�L�)E*�^T�^7��;��´��deS�bp�ew*[Y���� i!D���Hv����B�Y���m��Q*��,���Y?���l��V
s�*��2��*i�ȇ����d���\^'�V��3�m�8�Uxg�6�~�{��e[Խ�&�����MH7�k�~@F���~�;�a�������GM3��d�v�����A�o�C�:��Mwh9��A�����N�	�z��˕�]Q���<]�u�{���	�P�B��Ҡ�ᇎ9t�C�6������l�6@/ٷv?���p]֩K��c�o��æ�Եa��u�F���6Cv��c1�q��n���m:|c����wZ����!�@$������::,��Vt�$s��=�!	�� t�ahӵ�Y:���:���\����݁����!����������� t��)r~��RK-)���n#^��r9:��������� �3�6m�_�p�_��׮sm�M���s��sfp�w���+�+0������]r�Ȱn!�Z1c?N�}�+�͛6\�G��$��F����������6B�>��!��A����������Q`�� ے*E��R.d!R�qT��P �s�l�&��i"EU�Ҡ�\<2"� Cc �B$�C:��:I-�RFT��(��byO8�F�?V0��X!�
M�&���eQ$
/�/E4K*��>�I��@�H�C>P;_)@1#٨�wt'i& ���U@3�2�,�<WE��Pp,�xd���!��S�!�@�ш����1Pp+l,��f{�Hʤ��R���LU���mM*J�z`�~@��,*�f�nb%��Z�l�
^ZB�DNkY"�U�}󿱫6%�Vf�I{���k'� ��������=�{�f����4����]��~ծ�������<�h��:���eC��ٛ��߄ۆ�n&�� ��ö�9l������_YΫy�,
@�.).ƍ�dܡ<�8ų`[u�A�$K���QP�MI��!Sˌq�Ξ$�� �KQ������u,�ļ��&]A뎹������2l,^��A��b=:�cS�Q�>�FS\HHl� Qg�� ���hn�9b�NO7���is�n_���.��J=�x��ڥ-�����s�/[�ki�_g��:j��ƾmٿ�xR��T����׼�,ڳſa�~�Ŷ4��� �f$�yb֮����^���V�������Z��^b���+��!�]^������D.�t�=:�Et�v� ��M�6��bʽ��|k���3p�i9ùq&��R�MZ%9�h�=|�x0�� ���e�Ċ��]�%�o��}��_��5���\ϰ��v����1��\��q�D܌%e�
��U�\O5�r�<���Ы
9�)IzZ�Y5�̦t��E|�ŝ B���y���_q/�1��ЏWNxӳq�a�U����AST��*9�Es��H�D[�|G�b`��X�KY����sc�]_K�9�G$�C�'�)�6��L�7�v`c��)@�4���t���i�;̜��2������^�K=�Nt|��$��	�<���)����l�M?lm��	;:��+Z"��];-��\-������¨�j����Ob�Հ	c���~6�`c��)�y`�\}I�w2A�xcokÁ��&Q�sk6է��B��\Ef#���Z�0���:;;����O`���XM&��>����|O�o��폨��G��K��{�5Qp2��-=1��2OE$�VR��rl0]�2ߌ�^.w;�a�a��^���mk��|�[%$}C�����Hq"����Ѷ��+�͓9�=ֺS�}��d�I	!\Βh֜�P���UW���Lc�.�Xn��S�����~�`�<��h�rPj��^O[�V'Ӷ���8=k��P�<�g��	|�Gj��s"�F��Ծ��^]l5��o���l�>��5�������*"����0V����|$\H Y�HK��htڬ�h�t����=�}V�c��C�	\���vW{�����Z�F�aN�4���������?,<�p�?!��6͕�?l���)����0�� PK   n�~H7t1 ?  �  K  android-ndk-r11c/platforms/android-14/arch-arm/usr/include/machine/setjmp.hUT	 ���V���Vux [I  �  �VO�F=�|���&`�Ǟ�NNB[	 Vv|��HV"Ը[�����UK��Lr\��]����?��@�U�W��K�}��G?Jr�T�,��(�T�I+���I�ZN���2����Y�g8�P��)u���L$��*#)+��0|��
�_i����%+Ii�_U��A��.KcHhIG�YYʔ�Z=g)�GQ�N�����S��4c%�(�w��W~��5Cj������)N)�+���z櫆 BT�2K� ��x�fֆ��'Mr��>�G`��H��L+8���F�HURdQ�6i�ȇ��(��Dnވ�	�e��-��֏(
f�z��U��SoJ�\z���п���6�O�0"g9��2��:a~r"(�d��y��B/�(�_��>�` t���E��|=��7-��A��!k�GM
f��B���ğ��59��%�1�&Z9a���j���#�o�G�����>�.yw�2��֙�٦m�S����9�n�4��3�{�-D;�Cύ9��a#x���E+������CPN�0h`#�?kᒦ�¹A��7v�!�;H����J��$��x{tSK{�w��E��<����:��;�<P@$�<YG>S�c/׫��}���S�S;R@w��a�� |`\��fc@���C�ײ�01�s㎘�'D,a܉����ܿ�Ƿ����G�������븉�k�Տ�r��?#gz�i+�z���|��Dk��I w����="y�
ynd���x���=�Tb�hE��Z��^V�pm�Y(���zYڟ��d��<Aq��v<YrU썝<S�������xy%y���
m����R�i��)��m�7�D���V+�0�0�r�*&�4\�Q&<��Q�TjF���E��8�"A@��U�:��r�4A��K��$J�<�JU;.�qVnt[�!��_����,k�����Jj��;�H_���=����\���+������g������l�oe���dƟ��Әz�.�O_��H�b���D���B���y����<7���Jf44𣗎��@��O����f��~���HD����)�:
c����<���ޫtQsd���Kɔ�� �����(, ��:�� e
���O����]��)U'���]!4[EnH6�������g�0�A����P�Q����`��p]b7U	���3�2�D���=��l�����|�@G�� ^)y��~��j���V�j��I�/�&�ّ�EF��A���})�ön�q}l��A�?O/�=�1[6�v�n��@����#$]Ԋ�\�r��]���=�TJ��G�Z��uG�/e�U�	�U�U���R��g�]�/:��}2·]���m���O5C��x��l�L��④h�ՋU��6,֘��u�n�/��k�a�~�آ��:�"j��^=%F'�WznJx��u=�����7�S���������j�ug�m�|�Q�������V7�I�g����l8�f�`7�R��_�E����N�gꍯ��P�x�^�B��jY��c(�M�ſ.V�}���r����B�{���PK   n�~H?��  �  K  android-ndk-r11c/platforms/android-14/arch-arm/usr/include/machine/_types.hUT	 ���V���Vux [I  �  �W�R�H}6_�UI%@9v$KH��ʲ0SeK^] <)B����F&��o�HƒqB�a�2�gN��sf��ǽ�֊gcgr�|\�r��a48����?ߟGg0:��\|8�T��W�w<<8�;�c���c!��#}���O�Oq��.9���g��<�_�L�yQ
�H3z��8/2 �$�TB�K^�y4@Jb�H��w�yAAUr�yU�\�܉,(�ҲB.!/�߼�Ē摈EG��Ê���G�*�p ��T��y��"��0�"AA%�P\���G��ҔΦ�0�Y��� k%��._�Rc��O�K�>"D		��6��׭	��I R^�Gp�L�rdS�*,���j�S��U��l6m����zi y!����6���2����\�8Zς��9NY�]V� � a�5W^�MUi�w���ȁg�q:*XJ�K�Ga�x
!ƅڏ2������9\P�xHGC���UV��ltP�{�p�K�F���¶��Ę�����a�h�t�tm6�\�v��W����oi��4��/�p�l`�Ō!ۚ�2��3��7a����͙�0��S>"z	�%�[�¯ژ͘{�
�d�I�.1��v���4����F�&��g�|������FY�\i�YG'2ud�,Q��ʃ2'�6t��lG:������,����b�;�7��� \$��6צ(��[pKt�6�T0�xc�e��0���CTH��5��3�,G9�9F���J�,h.�x�9L�Lװmo�2�<"�+���b5��(�-SiF�,��x��}��2p�&O�ky�{�Kl-$fE?ݖX0�錡�A��0�8�-cX��F�U=%�6k�����W[
���5��0�5�ƺ$&�ӯ�����᫣���α��y�'�[������d�P��.��`z%�,�1��=�}�va8���
�D�w��m�o���`4a3B��AD����N�����i�=�/�}�o�p=���s_~~T���E�˼��&v�qop���������V�:�F�ʙeN��֒����_�ǳ���طQu�:���	�E&�*}��ښ&����Z���F�^LcQ������.�.�q���5ykk�i��a���2m@����)\�4�֛�_�:���vT�{}�e�g�3�\����eO�_�4�����wa�
�u�X�ID����oJX��rѱg`��d�G654�V�0-x@[�K[���.�P2�k��	YK�o�BgG�����C���b��
��uEm���k�����H�9E��"7��0��om�΂��Ku&J%�� ����x��GG�J!v��Lt��S��}�޼����w8mm�]%)2tѧ���S���'%�R'���"�
+Kn�¬��/��j���u�%��*�J�<S�@���wW�=K{\)���Jo���)�!�������:e�t�3��/PK   n�~H_��  
  K  android-ndk-r11c/platforms/android-14/arch-arm/usr/include/machine/limits.hUT	 ���V���Vux [I  �  �V]o�F}&�b�\针�w�Ъ�1�����^;}�:��5vj�$��wf1	���K��,;{��93^�8�|q�d2�!�j�����=C�ށv��k4[�f��aw0��`��Xf��'�R9o�4����1�K�N��m���[�ak �/ۭw4�O���i���e��Z��xK	�|�I�C�����z�Y���A�i���NF���!��̞eD�re��"S�B�	I�\�J O�Y(�΃J�lȸ�k�%�����bY��Z�0 ���'���BF��*�E�
]�"���E%��I���V�ҺU�P�VZ���\��)��X����B�[D��$-T(kxB��� �{Z-�&LƁZ�L{�>.�9�+uFk,����*K�(�+l�kZ��b<�UP�Lq�n�n����:u���8�'�J~2PI��m�A���\i��U��<H�ԑ�L"�I,e��!:�q
a���y�(^pJ�r� �!�B�\FC�l�+�K��&\�p��[�e�����1���\v�lO�a��tl��#�s\?~_�RH?.�=���˄ �>�Yy��5l�3Qn��?��u�l��O���<�F���	�L�kN�1���