<?php

/**
 * Wp in Progress
 * 
 * @package Jax Lite
 *
 * This source file is subject to the GNU GENERAL PUBLIC LICENSE (GPL 3.0)
 * It is also available at this URL: http://www.gnu.org/licenses/gpl-3.0.txt
 */

define( 'JAX_LITE_MIN_PHP_VERSION', '5.3' );

/*-----------------------------------------------------------------------------------*/
/* Switches back to the previous theme if the minimum PHP version is not met */
/*-----------------------------------------------------------------------------------*/ 

if ( ! function_exists( 'jax_lite_check_php_version' ) ) {

	function jax_lite_check_php_version() {
	
		if ( version_compare( PHP_VERSION, JAX_LITE_MIN_PHP_VERSION, '<' ) ) {
			add_action( 'admin_notices', 'jax_lite_min_php_not_met_notice' );
			switch_theme( get_option( 'theme_switched' ));
			return false;
	
		};
	}

	add_action( 'after_switch_theme', 'jax_lite_check_php_version' );

}

/*-----------------------------------------------------------------------------------*/
/* An error notice that can be displayed if the Minimum PHP version is not met */
/*-----------------------------------------------------------------------------------*/ 

if ( ! function_exists( 'jax_lite_min_php_not_met_notice' ) ) {

	function jax_lite_min_php_not_met_notice() {
		?>
		<div class="notice notice-error is_dismissable">
			<p>
				<?php esc_html_e('You need to update your PHP version to run this theme.', 'jax-lite' ); ?><br />
				<?php
				printf(
					esc_html__( 'Actual version is: %1$s, required version is: %2$s.', 'jax-lite' ),
					PHP_VERSION,
					JAX_LITE_MIN_PHP_VERSION
				);
				?>
			</p>
		</div>
		<?php
	
	}
	
}

/*-----------------------------------------------------------------------------------*/
/* THEME SETTINGS */
/*-----------------------------------------------------------------------------------*/ 

if (!function_exists('jaxlite_setting')) {

	function jaxlite_setting($id) {
	
		$jaxlite_setting = get_theme_mod($id);
			
		if(isset($jaxlite_setting))
			return $jaxlite_setting;
	
	}

}

/*-----------------------------------------------------------------------------------*/
/* POST META */
/*-----------------------------------------------------------------------------------*/ 

if (!function_exists('jaxlite_postmeta')) {

	function jaxlite_postmeta($id) {
	
		global $post;
		
		$val = get_post_meta( $post->ID , $id, TRUE);
			
		if ( isset($val) ) :
			
			return $val; 
				
		else :
		
			return null;
		
		endif;
			
		
	}

}

/*-----------------------------------------------------------------------------------*/
/* HEADER IMAGE */
/*-----------------------------------------------------------------------------------*/ 

if (!function_exists('jaxlite_header_image')) {

	function jaxlite_header_image() {

		return get_header_image();
	
	}

}

/*-----------------------------------------------------------------------------------*/
/* POST ICON */
/*-----------------------------------------------------------------------------------*/ 

if (!function_exists('jaxlite_posticon')) {

	function jaxlite_posticon() {
	
		$icons = array (
				
			"video" => "genericon-video" , 
			"gallery" => "genericon-image" , 
			"audio" => "genericon-audio" , 
			"chat" => "genericon-chat", 
			"status" => "genericon-status", 
			"image" => "genericon-picture", 
			"quote" => "genericon-quote" , 
			"link" => "genericon-external", 
			"aside" => "genericon-aside"
			
		);
		
		if ( get_post_format() ) : 
			
			$icon = '<span class="genericon '.$icons[get_post_format()].'"></span> '.ucfirst(get_post_format()); 
			
		else:
			
			$icon = '<span class="genericon genericon-standard"></span> Standard'; 
			
		endif;
		
		return $icon;
		
	}

}

/*-----------------------------------------------------------------------------------*/
/* HEADER LAYOUT */
/*-----------------------------------------------------------------------------------*/ 

if (!function_exists('jaxlite_get_header_layout')) {

	function jaxlite_get_header_layout() {

		if ( is_home() )  {
		
			$layout = "header_one";
			
		} else {

			$layout = "header_two";

		}
		
		return $layout;
	
	}

}

/*-----------------------------------------------------------------------------------*/
/* Content template */
/*-----------------------------------------------------------------------------------*/ 

if (!function_exists('jaxlite_template')) {

	function jaxlite_template($id) {
	
		$template = array ("full" => "col-md-12" , "left-sidebar" => "col-md-8" , "right-sidebar" => "col-md-8" );
	
		$span = $template["right-sidebar"];
		$sidebar =  "right-sidebar";
	
		if  ( ( (is_category()) || (is_tag()) || (is_tax()) || (is_month() ) ) && (jaxlite_setting('jaxlite_category_layout')) ) {
			
			$span = $template[jaxlite_setting('jaxlite_category_layout')];
			$sidebar =  jaxlite_setting('jaxlite_category_layout');
				
		} else if ( (is_home()) && (jaxlite_setting('jaxlite_home')) ) {
			
			$span = $template[jaxlite_setting('jaxlite_home')];
			$sidebar =  jaxlite_setting('jaxlite_home');
			
		} else if ( (is_search()) && (jaxlite_setting('jaxlite_search_layout')) ) {
			
			$span = $template[jaxlite_setting('jaxlite_search_layout')];
			$sidebar =  jaxlite_setting('jaxlite_search_layout');
			
		} else if ( ( (is_single()) || (is_page()) ) && (jaxlite_postmeta('jaxlite_template')) ) {
			
			$span = $template[jaxlite_postmeta('jaxlite_template')];
			$sidebar =  jaxlite_postmeta('jaxlite_template');
				
		}
	
		return ${$id};
		
	}

}

/*-----------------------------------------------------------------------------------*/
/* PRETTYPHOTO */
/*-----------------------------------------------------------------------------------*/   

if (!function_exists('jaxlite_prettyPhoto')) {

	function jaxlite_prettyPhoto( $html, $id, $size, $permalink, $icon, $text ) {
		
		if ( ! $permalink )
			return str_replace( '<a', '<a rel="prettyPhoto" ', $html );
		else
			return $html;
	
	}
	
	add_filter( 'wp_get_attachment_link', 'jaxlite_prettyPhoto', 10, 6);
	
}

/*-----------------------------------------------------------------------------------*/
/* REMOVE CATEGORY LIST REL */
/*-----------------------------------------------------------------------------------*/   

if (!function_exists('jaxlite_remove_category_list_rel')) {

	function jaxlite_remove_category_list_rel($output) {
		$output = str_replace('rel="category"', '', $output);
		return $output;
	}
	
	add_filter('wp_list_categories', 'jaxlite_remove_category_list_rel');
	add_filter('the_category', 'jaxlite_remove_category_list_rel');

}

/*-----------------------------------------------------------------------------------*/
/* REMOVE THUMBNAIL DIMENSION */
/*-----------------------------------------------------------------------------------*/ 

if (!function_exists('jaxlite_remove_thumbnail_dimensions')) {

	function jaxlite_remove_thumbnail_dimensions( $html, $post_id, $post_image_id ) {
		$html = preg_replace( '/(width|height)=\"\d*\"\s/', "", $html );
		return $html;
	}
	
	add_filter( 'post_thumbnail_html', 'jaxlite_remove_thumbnail_dimensions', 10, 3 );

}

/*-----------------------------------------------------------------------------------*/
/* REMOVE CSS GALLERY */
/*-----------------------------------------------------------------------------------*/ 

if (!function_exists('jaxlite_my_gallery_style')) {

	function jaxlite_my_gallery_style() {
		return "<div class='gallery'>";
	}
	
	add_filter( 'gallery_style', 'jaxlite_my_gallery_style', 99 );
	
}

/*-----------------------------------------------------------------------------------*/
/* ALLOWED PROTOCOLS */
/*-----------------------------------------------------------------------------------*/ 

if (!function_exists('jaxlite_kses_allowed_protocols')) {

	function jaxlite_kses_allowed_protocols($protocols) {
		
		$protocols[] = 'skype';
		return $protocols;
	
	}

	add_filter( 'kses_allowed_protocols', 'jaxlite_kses_allowed_protocols');

}

/*-----------------------------------------------------------------------------------*/
/*RESPONSIVE EMBED */
/*-----------------------------------------------------------------------------------*/ 

if (!function_exists('jaxlite_embed_html')) {
	
	function jaxlite_embed_html( $html ) {
		return '<div class="embed-container">' . $html . '</div>';
	}
	 
	add_filter( 'embed_oembed_html', 'jaxlite_embed_html', 10, 3 );
	add_filter( 'video_embed_html', 'jaxlite_embed_html' );
	
}

/*-----------------------------------------------------------------------------------*/
/* GET ARCHIVE TITLE */
/*-----------------------------------------------------------------------------------*/ 

if (!function_exists('jaxlite_get_the_archive_title')) {

	function jaxlite_get_archive_title() {
		
		if ( is_category() ) {
			$title = sprintf( esc_html__( 'Category: %s', 'jax-lite' ), single_cat_title( '', false ) );
		} elseif ( is_tag() ) {
			$title = sprintf( esc_html__( 'Tag: %s', 'jax-lite' ), single_tag_title( '', false ) );
		} elseif ( is_author() ) {
			$title = sprintf( esc_html__( 'Author: %s', 'jax-lite' ), '<span class="vcard">' . get_the_author() . '</span>' );
		} elseif ( is_year() ) {
			$title = sprintf( esc_html__( 'Year: %s', 'jax-lite' ), get_the_date( esc_html_x( 'Y', 'yearly archives date format', 'jax-lite' ) ) );
		} elseif ( is_month() ) {
			$title = sprintf( esc_html__( 'Month: %s', 'jax-lite' ), get_the_date( esc_html_x( 'F Y', 'monthly archives date format', 'jax-lite' ) ) );
		} elseif ( is_day() ) {
			$title = sprintf( esc_html__( 'Day: %s', 'jax-lite' ), get_the_date( esc_html_x( 'F j, Y', 'daily archives date format', 'jax-lite' ) ) );
		} elseif ( is_tax( 'post_format' ) ) {
			if ( is_tax( 'post_format', 'post-format-aside' ) ) {
				$title = esc_html_x( 'Asides', 'post format archive title', 'jax-lite' );
			} elseif ( is_tax( 'post_format', 'post-format-gallery' ) ) {
				$title = esc_html_x( 'Galleries', 'post format archive title', 'jax-lite' );
			} elseif ( is_tax( 'post_format', 'post-format-image' ) ) {
				$title = esc_html_x( 'Images', 'post format archive title', 'jax-lite' );
			} elseif ( is_tax( 'post_format', 'post-format-video' ) ) {
				$title = esc_html_x( 'Videos', 'post format archive title', 'jax-lite' );
			} elseif ( is_tax( 'post_format', 'post-format-quote' ) ) {
				$title = esc_html_x( 'Quotes', 'post format archive title', 'jax-lite' );
			} elseif ( is_tax( 'post_format', 'post-format-link' ) ) {
				$title = esc_html_x( 'Links', 'post format archive title', 'jax-lite' );
			} elseif ( is_tax( 'post_format', 'post-format-status' ) ) {
				$title = esc_html_x( 'Statuses', 'post format archive title', 'jax-lite' );
			} elseif ( is_tax( 'post_format', 'post-format-audio' ) ) {
				$title = esc_html_x( 'Audio', 'post format archive title', 'jax-lite' );
			} elseif ( is_tax( 'post_format', 'post-format-chat' ) ) {
				$title = esc_html_x( 'Chats', 'post format archive title', 'jax-lite' );
			}
		} elseif ( is_post_type_archive() ) {
			$title = sprintf( esc_html__( 'Archives: %s', 'jax-lite' ), post_type_archive_title( '', false ) );
		} elseif ( is_tax() ) {
			$tax = get_taxonomy( get_queried_object()->taxonomy );
			$title = sprintf( esc_html__( '%1$s: %2$s', 'jax-lite' ), $tax->labels->singular_name, single_term_title( '', false ) );
		}
	
		if ( isset($title) )  :
			return $title;
		else:
			return false;
		endif;
	
	}

}

/*-----------------------------------------------------------------------------------*/
/* IS SINGLE */
/*-----------------------------------------------------------------------------------*/ 

if (!function_exists('jaxlite_is_single')) {

	function jaxlite_is_single() {
		
		if ( is_single() || is_page() ) :
		
			return true;
		
		endif;
	
	}

}

/*-----------------------------------------------------------------------------------*/
/* POST CLASS */
/*-----------------------------------------------------------------------------------*/   

if (!function_exists('jaxlite_post_class')) {

	function jaxlite_post_class($classes) {	

		$masonry  = 'post-container masonry-element col-md-4';
		$standard = 'post-container col-md-12';
		
		if ( ( !jaxlite_is_single()) && ( is_home() ) ) {
			
			if ( ( !jaxlite_setting('jaxlite_home')) || ( jaxlite_setting('jaxlite_home') == "masonry" ) ) {

				$classes[] = $masonry;

			} else {

				$classes[] = $standard;

			}
			
		} else if ( ( !jaxlite_is_single()) && ( jaxlite_get_archive_title() ) ) {
			
			if ( ( !jaxlite_setting('jaxlite_category_layout')) || ( jaxlite_setting('jaxlite_category_layout') == "masonry" ) ) {

				$classes[] = $masonry;

			} else {

				$classes[] = $standard;

			}
			
		} else if ( ( !jaxlite_is_single()) && ( is_search() ) ) {
			
			if ( ( !jaxlite_setting('jaxlite_search_layout')) || ( jaxlite_setting('jaxlite_search_layout') == "masonry" ) ) {

				$classes[] = $masonry;

			} else {

				$classes[] = $standard;

			}
			
		} else if ( jaxlite_is_single() ) {

			$classes[] = 'post-container col-md-12';

		}
	
		return $classes;
		
	}
	
	add_filter('post_class', 'jaxlite_post_class');

}


/*-----------------------------------------------------------------------------------*/
/* VERSION */
/*-----------------------------------------------------------------------------------*/ 

if (!function_exists('jaxlite_remove_version')) {

	function jaxlite_remove_version( $src ) {
	
		if ( strpos( $src, 'ver=' ) )
	
			$src = remove_query_arg( 'ver', $src );
	
		return $src;
	
	}

	add_filter( 'style_loader_src', 'jaxlite_remove_version', 9999 );
	add_filter( 'script_loader_src', 'jaxlite_remove_version', 9999 );

}

/*-----------------------------------------------------------------------------------*/
/* BODY CLASSES */
/*-----------------------------------------------------------------------------------*/   

if (!function_exists('jaxlite_body_classes_function')) {

	function jaxlite_body_classes_function( $classes ) {

		global $wp_customize;

		if ( jaxlite_setting('jaxlite_infinitescroll_system') == "on" ) :
		
			$classes[] = 'infinitescroll';
				
		endif;

		if ( !jaxlite_setting('jaxlite_animated_titles') || jaxlite_setting('jaxlite_animated_titles') == "on" ) :
		
			$classes[] = 'animatedtitles-active';
				
		endif;

		if ( !jaxlite_setting('jaxlite_preloading_system') || jaxlite_setting('jaxlite_preloading_system') == "on" ) :
		
			$classes[] = 'animsition-active';
			
		else:

			$classes[] = 'animsition-inactive';

		endif;

		if ( ( jaxlite_is_single() ) && ( ( jaxlite_get_header_layout() == "header_five") || ( jaxlite_get_header_layout() == "header_six") ) ) :
		
			$classes[] = 'hide_title';
				
		endif;

		if (preg_match('~MSIE|Internet Explorer~i', $_SERVER['HTTP_USER_AGENT']) || (strpos($_SERVER['HTTP_USER_AGENT'], 'Trident/7.0; rv:11.0') !== false)) :

			$classes[] = 'ie_browser';
		
		endif;

		if ( isset( $wp_customize ) ) :

			$classes[] = 'customizer_active';
				
		endif;
	
		return $classes;

	}
	
	add_filter( 'body_class', 'jaxlite_body_classes_function' );

}

/*-----------------------------------------------------------------------------------*/
/* WRAP CLASS */
/*-----------------------------------------------------------------------------------*/   

if (!function_exists('jaxlite_wrap_class')) {

	function jaxlite_wrap_class() {
		
		if ( !jaxlite_setting('jaxlite_preloading_system') || jaxlite_setting('jaxlite_preloading_system') == "on" ) :
		
			echo 'class="animsition"';

		endif;

	}
	
}

/*-----------------------------------------------------------------------------------*/
/* SIDEBAR NAME */
/*-----------------------------------------------------------------------------------*/ 

if (!function_exists('jaxlite_sidebar_name')) {

	function jaxlite_sidebar_name( $type ) {

		$sidebars = array (
		
			"header" => array ( 
				"postmeta" => "jaxlite_header_sidebar",
				"default" => "header-sidebar-area"
			),
			
			"side" => array ( 
				"postmeta" => "jaxlite_sidebar",
				"default" => "side-sidebar-area"
			),
			
			"scroll" => array ( 
				"postmeta" => "jaxlite_scroll_sidebar",
				"default" => "scroll-sidebar-area"
			),
			
			"bottom" => array ( 
				"postmeta" => "jaxlite_bottom_sidebar",
				"default" => "bottom-sidebar-area"
			),
			
			"footer" => array ( 
				"postmeta" => "jaxlite_footer_sidebar",
				"default" => "footer-sidebar-area"
			),
			
		);
	
		if ( jaxlite_is_single() ) :
				
			$sidebar_name = jaxlite_postmeta($sidebars[$type]['postmeta']);
				
		else :

			$sidebar_name = $sidebars[$type]['default'];

		endif;
		
		return $sidebar_name;

	}

}

/*-----------------------------------------------------------------------------------*/
/* SIDEBAR LIST */
/*-----------------------------------------------------------------------------------*/ 

if (!function_exists('jaxlite_sidebar_list')) {

	function jaxlite_sidebar_list($sidebar_type) {
		
		$default = array("none" => "None", $sidebar_type."-sidebar-area" => "Default");
			
		return $default;
			
	}

}

/*-----------------------------------------------------------------------------------*/
/* GET PAGED */
/*-----------------------------------------------------------------------------------*/ 

if (!function_exists('jaxlite_paged')) {

	function jaxlite_paged() {
		
		if ( get_query_var('paged') ) {
			$paged = get_query_var('paged');
		} elseif ( get_query_var('page') ) {
			$paged = get_query_var('page');
		} else {
			$paged = 1;
		}
		
		return $paged;
		
	}

}


/*-----------------------------------------------------------------------------------*/
/* EXCERPT MORE  */
/*-----------------------------------------------------------------------------------*/   

if (!function_exists('jaxlite_hide_excerpt_more')) {

	function jaxlite_hide_excerpt_more() {
		return '';
	}
	
	add_filter('the_content_more_link', 'jaxlite_hide_excerpt_more');
	add_filter('excerpt_more', 'jaxlite_hide_excerpt_more');

}

/*-----------------------------------------------------------------------------------*/
/* Customize excerpt more */
/*-----------------------------------------------------------------------------------*/

if (!function_exists('jaxlite_customize_excerpt_more')) {

	function jaxlite_customize_excerpt_more( $excerpt ) {

		global $post;

		if ( jaxlite_is_single() ) :

			return $excerpt;

		else:

			$allowed = array(
				'span' => array(
					'class' => array(),
				),
			);
	
			$class = 'button';
			$button = esc_html__('Read more',"jax-lite");
	
			if ( jaxlite_setting('jaxlite_readmore_button') == "off" ) : 
			
				$class = 'more';
				$button = ' [...] ';
	
			endif;

			if ( 
				( $pos=strpos($post->post_content, '<!--more-->') ) && 
				!has_excerpt($post->ID)
			): 
			
				$content = apply_filters( 'the_content', get_the_content());
			
			else:
			
				$content = $excerpt;
	
			endif;
	
			return $content. '<a class="'. wp_kses($class, $allowed) . '" href="' . esc_url(get_permalink($post->ID)) . '" title="'.esc_html__('Read More','jax-lite').'">' . $button . '</a>';

		endif;
		

	}
	
	add_filter( 'get_the_excerpt', 'jaxlite_customize_excerpt_more' );

}

/*-----------------------------------------------------------------------------------*/
/* THUMBNAILS */
/*-----------------------------------------------------------------------------------*/         

if (!function_exists('jaxlite_get_width')) {

	function jaxlite_get_width() {
		
		if ( jaxlite_setting('jaxlite_screen3') ):
			return jaxlite_setting('jaxlite_screen3');
		else:
			return "940";
		endif;
	
	}

}

if (!function_exists('jaxlite_get_height')) {

	function jaxlite_get_height() {
		
		if ( jaxlite_setting('jaxlite_thumbnails') ):
			return jaxlite_setting('jaxlite_thumbnails');
		else:
			return "600";
		endif;
	
	}

}

/*-----------------------------------------------------------------------------------*/
/* STYLES AND SCRIPTS */
/*-----------------------------------------------------------------------------------*/ 

if (!function_exists('jaxlite_scripts_styles')) {

	function jaxlite_scripts_styles() {
		
		$fonts_args = array(
			'family' =>	str_replace('|', '%7C','PT+Sans|Montserrat:400,300,100,700'),
			'subset' =>	'latin,greek,greek-ext,vietnamese,cyrillic-ext,latin-ext,cyrillic'
		);
		
		wp_enqueue_style('google-fonts', add_query_arg ( $fonts_args, "https://fonts.googleapis.com/css" ), array(), null );
		wp_enqueue_style('animsition', get_template_directory_uri() . '/assets/css/animsition.css', array(), '4.0.2' );
		wp_enqueue_style('bootstrap', get_template_directory_uri() . '/assets/css/bootstrap.css', array(), '3.3.7' );
		wp_enqueue_style('font-awesome', get_template_directory_uri() . '/assets/css/font-awesome.css', array(), '4.7.0' );
		wp_enqueue_style('genericons', get_template_directory_uri() . '/assets/css/genericons.css', array(), '4.0.5' );
		wp_enqueue_style('jax-lite-iestyles', get_template_directory_uri() . '/assets/css/iestyles.css', array(), '1.0.0' );
		wp_enqueue_style('prettyPhoto', get_template_directory_uri() . '/assets/css/prettyPhoto.css', array(), '3.1.6' );
		wp_enqueue_style('swipebox', get_template_directory_uri() . '/assets/css/swipebox.css', array(), '1.3.0' );
		wp_enqueue_style('jax-lite-template', get_template_directory_uri() . '/assets/css/template.css', array(), '1.0.0' );

		if ( get_theme_mod('jaxlite_skin') && get_theme_mod('jaxlite_skin') <> "turquoise" ) :
	
			wp_enqueue_style(
				'jaxlite ' . get_theme_mod('jaxlite_skin'),
				get_template_directory_uri() . '/assets/skins/' . get_theme_mod('jaxlite_skin') . '.css'
			); 
	
		endif;

		if ( is_singular() ) wp_enqueue_script( 'comment-reply' );
	
		wp_enqueue_script('animsition', get_template_directory_uri() . '/assets/js/animsition.js' , array('jquery'), '4.0.2', TRUE ); 
		wp_enqueue_script('blast', get_template_directory_uri() . '/assets/js/blast.js' , array('jquery'), '2.0.0', TRUE ); 
		wp_enqueue_script('jquery-easing', get_template_directory_uri() . '/assets/js/jquery.easing.js' , array('jquery'), '1.3', TRUE ); 
		wp_enqueue_script('jquery-infinitescroll', get_template_directory_uri() . '/assets/js/jquery.infinitescroll.js' , array('jquery'), '2.0.2', TRUE ); 
		wp_enqueue_script('jquery-nicescroll', get_template_directory_uri() . '/assets/js/jquery.nicescroll.js' , array('jquery'), '3.7.6', TRUE ); 
		wp_enqueue_script('jquery-scrollTo', get_template_directory_uri() . '/assets/js/jquery.scrollTo.js' , array('jquery'), '2.1.2', TRUE ); 
		wp_enqueue_script('jquery-velocity', get_template_directory_uri() . '/assets/js/jquery.velocity.js' , array('jquery'), '1.2.3', TRUE ); 
		wp_enqueue_script('jquery-velocity-ui', get_template_directory_uri() . '/assets/js/jquery.velocity.ui.js' , array('jquery'), '5.0.4', TRUE ); 
		wp_enqueue_script('modernizr', get_template_directory_uri() . '/assets/js/modernizr.js' , array('jquery'), '2.6.2', TRUE ); 
		wp_enqueue_script('prettyPhoto', get_template_directory_uri() . '/assets/js/prettyPhoto.js' , array('jquery'), '3.1.4', TRUE ); 
		wp_enqueue_script('swipebox', get_template_directory_uri() . '/assets/js/swipebox.js' , array('jquery'), '1.4.4', TRUE ); 
		wp_enqueue_script('touchSwipe.js', get_template_directory_uri() . '/assets/js/touchSwipe.js' , array('jquery'), '1.6.18', TRUE ); 
		wp_enqueue_script('jax-lite-mobile', get_template_directory_uri() . '/assets/js/jquery.mobile.js' , array('jquery'), '1.0.0', TRUE ); 
		wp_enqueue_script('jax-lite-template', get_template_directory_uri() . '/assets/js/template.js' , array('jquery','masonry'), '1.0.0', TRUE ); 
		
		wp_enqueue_script('html5shiv', get_template_directory_uri().'/assets/scripts/html5shiv.js', FALSE, '3.7.3');
		wp_script_add_data('html5shiv', 'conditional', 'IE 8' );
		
		wp_enqueue_script('selectivizr', get_template_directory_uri().'/assets/scripts/selectivizr.js', FALSE, '1.0.3b');
		wp_script_add_data('selectivizr', 'conditional', 'IE 8' );

	}
	
	add_action( 'wp_enqueue_scripts', 'jaxlite_scripts_styles', 11 );

}

/*-----------------------------------------------------------------------------------*/
/* THEME SETUP */
/*-----------------------------------------------------------------------------------*/   

if (!function_exists('jaxlite_setup')) {

	function jaxlite_setup() {

		global $content_width;

		if ( ! isset( $content_width ) )
			$content_width = jaxlite_get_width();
	
		add_theme_support( 'post-formats', array( 'aside','gallery','quote','video','audio','link','status','chat','image' ) );
		add_theme_support( 'automatic-feed-links' );
		add_theme_support( 'post-thumbnails' );
	
		add_image_size( 'thumbnail', jaxlite_get_width(), jaxlite_get_height(), TRUE ); 
		
		add_theme_support( 'title-tag' );

		add_image_size( 'large', 449,304, TRUE ); 
		add_image_size( 'medium', 290,220, TRUE ); 
		add_image_size( 'small', 211,150, TRUE ); 
	
		register_nav_menu(
			'main-menu', esc_html__( 'Main menu', 'jax-lite' )
		);

		load_theme_textdomain("jax-lite", get_template_directory() . '/languages');
		
		add_theme_support( 'custom-background', array(
			'default-color' => 'f3f3f3',
		) );
		
		register_default_headers( array(
			'default-image' => array(
				'url'           => get_stylesheet_directory_uri() . '/assets/images/background/header.jpg',
				'thumbnail_url' => get_stylesheet_directory_uri() . '/assets/images/background/resized-header.jpg',
				'description'   => __( 'Default image', 'jax-lite' )
			),
		));

		add_theme_support( 'custom-header', array( 
			'width'         => 1920,
			'height'        => 478,
			'default-image' => get_stylesheet_directory_uri() . '/assets/images/background/header.jpg',
			'default-text-color' => 'fafafa',
		));

		require_once( trailingslashit( get_template_directory() ) . '/core/includes/class-customize.php' );
		require_once( trailingslashit( get_template_directory() ) . '/core/includes/class-metaboxes.php' );
		require_once( trailingslashit( get_template_directory() ) . '/core/includes/class-notice.php' );
		require_once( trailingslashit( get_template_directory() ) . '/core/includes/class-plugin-activation.php' );
		require_once( trailingslashit( get_template_directory() ) . '/core/admin/customize/customize.php' );
		require_once( trailingslashit( get_template_directory() ) . '/core/post-formats/image-format.php' );
		require_once( trailingslashit( get_template_directory() ) . '/core/post-formats/page-format.php' );
		require_once( trailingslashit( get_template_directory() ) . '/core/post-formats/standard-format.php' );
		require_once( trailingslashit( get_template_directory() ) . '/core/functions/function-required_plugins.php' );
		require_once( trailingslashit( get_template_directory() ) . '/core/functions/function-style.php' );
		require_once( trailingslashit( get_template_directory() ) . '/core/functions/function-widgets.php' );
		require_once( trailingslashit( get_template_directory() ) . '/core/templates/after-content.php' );
		require_once( trailingslashit( get_template_directory() ) . '/core/templates/before-content.php' );
		require_once( trailingslashit( get_template_directory() ) . '/core/templates/bottom_sidebar.php' );
		require_once( trailingslashit( get_template_directory() ) . '/core/templates/footer.php' );
		require_once( trailingslashit( get_template_directory() ) . '/core/templates/footer_sidebar.php' );
		require_once( trailingslashit( get_template_directory() ) . '/core/templates/header_layouts.php' );
		require_once( trailingslashit( get_template_directory() ) . '/core/templates/header_sidebar.php' );
		require_once( trailingslashit( get_template_directory() ) . '/core/templates/logo.php' );
		require_once( trailingslashit( get_template_directory() ) . '/core/templates/masonry.php' );
		require_once( trailingslashit( get_template_directory() ) . '/core/templates/media.php' );
		require_once( trailingslashit( get_template_directory() ) . '/core/templates/pagination.php' );
		require_once( trailingslashit( get_template_directory() ) . '/core/templates/post-formats.php' );
		require_once( trailingslashit( get_template_directory() ) . '/core/templates/slogan.php' );
		require_once( trailingslashit( get_template_directory() ) . '/core/templates/title.php' );
		require_once( trailingslashit( get_template_directory() ) . '/core/scripts/infinitescroll.php' );
		require_once( trailingslashit( get_template_directory() ) . '/core/scripts/infinitescroll_masonry.php' );
		require_once( trailingslashit( get_template_directory() ) . '/core/scripts/masonry.php' );
		require_once( trailingslashit( get_template_directory() ) . '/core/metaboxes/pages.php' );
		require_once( trailingslashit( get_template_directory() ) . '/core/metaboxes/posts.php' );

	}

	add_action( 'after_setup_theme', 'jaxlite_setup' );

}

?>