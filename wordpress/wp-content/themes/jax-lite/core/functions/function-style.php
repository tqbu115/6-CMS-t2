<?php 

if (!function_exists('jaxlite_css_custom')) {

	function jaxlite_css_custom() { 
	
		$css = '';
		
	/* =================== BODY STYLE =================== */
	
		if ( get_theme_mod('jaxlite_full_image_background') == "on" )
			$css .="body {  -webkit-background-size: cover;-moz-background-size: cover;-o-background-size: cover;background-size: cover;}"; 
	
	/* =================== END BODY STYLE =================== */
	
	/* =================== HEADER STYLE =================== */
	  
		if ( ( get_theme_mod('jaxlite_full_image_header_background') == "on" ) || ( !get_theme_mod('jaxlite_full_image_header_background'))  ) :
				
			$css .="#header { -webkit-background-size: cover;-moz-background-size: cover;-o-background-size: cover;background-size: cover;}"; 
			
		else:
	
			$css .="#header { -webkit-background-size: inherit;-moz-background-size: inherit;-o-background-size: inherit;background-size: inherit;}"; 
	
		endif;
			
		if ( get_theme_mod('jaxlite_header_background_position'))
			$css .="#header { background-position:" . get_theme_mod('jaxlite_header_background_position').";}"; 
			
		if ( get_theme_mod('jaxlite_header_background_repeat'))
			$css .="#header { background-repeat:" . get_theme_mod('jaxlite_header_background_repeat').";}"; 
			
		if ( get_theme_mod('jaxlite_header_background_attachment'))
			$css .="#header { background-attachment:" . get_theme_mod('jaxlite_header_background_attachment').";}"; 
			
		if ( get_theme_mod('jaxlite_header_padding'))
			$css .="#header { padding: ". get_theme_mod('jaxlite_header_padding')." 0; }"; 
	
		if ( get_theme_mod('header_image') )
			$css .="#header { background-image:url('" . get_theme_mod('header_image') . "')}";
	
		if ( get_theme_mod('header_image') == "remove-header" ) {
	
			$css .="#header { background:none !important; margin-bottom:0 !important; padding:50px 0 !important;}"; 
	
		}
	
	/* =================== END HEADER STYLE =================== */
	
		if ( get_theme_mod('header_textcolor') ) {
	
			$css .='#header a, #header .navigation i, #logo a span.sitename, #logo a span.sitedescription, #slogan, #slogan h1, #slogan span { color: #'.get_theme_mod('header_textcolor').'; } ';
	
		}
	
		if ( jaxlite_setting('jaxlite_header_textcolor_hover') ) {
		
			$css .='#header a:hover, #logo a:hover span.sitename, #logo a:hover span.sitedescription , #header .navigation i:hover { color: '.jaxlite_setting('jaxlite_header_textcolor_hover').' }';
	
		}	
	
	/* =================== BEGIN PAGE WIDTH =================== */
	
		if (jaxlite_setting('jaxlite_screen1')) {
		
			$css .="@media (min-width:768px){.container{width:".jaxlite_setting('jaxlite_screen1')."px}}"; 
			$css .="@media (min-width:768px){.container.block{width:" . (jaxlite_setting('jaxlite_screen1')-10) . "px}}"; 
		}
		
		if (jaxlite_setting('jaxlite_screen2')) {
			
			$css .="@media (min-width:992px){.container{width:".jaxlite_setting('jaxlite_screen2')."px}}"; 
			$css .="@media (min-width:992px){.container.block{width:" . (jaxlite_setting('jaxlite_screen2')-10) . "px}}"; 
		}
		
		if (jaxlite_setting('jaxlite_screen3'))  {
			
			$css .="@media (min-width:1200px){.container{width:".jaxlite_setting('jaxlite_screen3')."px}}"; 
			$css .="@media (min-width:1200px){.container.block{width:" . (jaxlite_setting('jaxlite_screen3')-10) . "px}}"; 
	
		}
		
		if (jaxlite_setting('jaxlite_screen4'))  {
			
			$css .="@media (min-width:1400px){.container{width:".jaxlite_setting('jaxlite_screen4')."px}}"; 
			$css .="@media (min-width:1400px){.container.block{width:" . (jaxlite_setting('jaxlite_screen4')-10) . "px}}"; 
	
		}
		
	/* =================== END PAGE WIDTH =================== */
	
	/* =================== BEGIN LOGO STYLE =================== */
	
		/* Logo Font Size */
		if ( jaxlite_setting('jaxlite_logo_font_size')) 
			$css .="#logo a span.sitename { font-size:".jaxlite_setting('jaxlite_logo_font_size')."; } ";  
		
		/* Logo Description */
		if ( jaxlite_setting('jaxlite_logo_description_size')) 
			$css .="#logo a span.sitedescription { font-size:".jaxlite_setting('jaxlite_logo_description_size')."; } ";  
	
	/* =================== END LOGO STYLE =================== */
	
	/* =================== BEGIN SLOGAN STYLE =================== */
	
		/* Slogan Font Size */
		if (jaxlite_setting('jaxlite_slogan_font_size')) 
			$css .="#slogan, #slogan h1 { font-size:".jaxlite_setting('jaxlite_slogan_font_size')."; } ";  
		
		/* Subslogan Font Size */
		if (jaxlite_setting('jaxlite_subslogan_font_size')) 
			$css .="#slogan span.description { font-size:".jaxlite_setting('jaxlite_subslogan_font_size')."; } ";  
	
	/* =================== END SLOGAN STYLE =================== */
	
	/* =================== BEGIN NAV STYLE =================== */
	
		$navstyle = '';
	
		/* Nav  Font Size */
		
		if (jaxlite_setting('jaxlite_menu_font_size')) :
		
			$css .="nav.custommenu ul li a, #footer nav.custommenu ul li a { font-size:" . jaxlite_setting('jaxlite_menu_font_size') . ";}"; 
			$css .="nav.custommenu ul ul li a, #footer nav.custommenu ul ul li a { font-size:" . ( str_replace("px", "", jaxlite_setting('jaxlite_menu_font_size')) - 4 ) . "px;}"; 
		
		endif;
	
	/* =================== END NAV STYLE =================== */
	
	/* =================== BEGIN CONTENT STYLE =================== */
	
		if (jaxlite_setting('jaxlite_content_font_size')) 
			$css .=".post-article p, .post-article li, .post-article address, .post-article dd, .post-article blockquote, .post-article td, .post-article th, .textwidget, .toggle_container h5.element  { font-size:".jaxlite_setting('jaxlite_content_font_size')."}"; 
		
	
	/* =================== END CONTENT STYLE =================== */
	
	/* =================== START TITLE STYLE =================== */
	
		$titlestyle = '';
	
		if (jaxlite_setting('jaxlite_h1_font_size')) 
			$css .="h1 {font-size:".jaxlite_setting('jaxlite_h1_font_size')."; }"; 
		if (jaxlite_setting('jaxlite_h2_font_size')) 
			$css .="h2 { font-size:".jaxlite_setting('jaxlite_h2_font_size')."; }"; 
		if (jaxlite_setting('jaxlite_h3_font_size')) 
			$css .="h3 { font-size:".jaxlite_setting('jaxlite_h3_font_size')."; }"; 
		if (jaxlite_setting('jaxlite_h4_font_size')) 
			$css .="h4 { font-size:".jaxlite_setting('jaxlite_h4_font_size')."; }"; 
		if (jaxlite_setting('jaxlite_h5_font_size')) 
			$css .="h5 { font-size:".jaxlite_setting('jaxlite_h5_font_size')."; }"; 
		if (jaxlite_setting('jaxlite_h6_font_size')) 
			$css .="h6 { font-size:".jaxlite_setting('jaxlite_h6_font_size')."; }"; 
	
	
	/* =================== END TITLE STYLE =================== */
	
		wp_add_inline_style( 'jax-lite-template', $css );
	
	}
	
	add_action('wp_enqueue_scripts', 'jaxlite_css_custom', 999);

}

?>