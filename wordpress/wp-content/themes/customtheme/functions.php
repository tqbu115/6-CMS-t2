<?php

function cwd_wp_bootstrap_scripts_styles() {
  // Loads Bootstrap minified JavaScript file.
  wp_enqueue_script('bootstrapjs', '//netdna.bootstrapcdn.com/bootstrap/3.0.0/js/bootstrap.min.js', array('jquery'),'3.0.0', true );
  // Loads Bootstrap minified CSS file.
  wp_enqueue_style('bootstrapwp', '//netdna.bootstrapcdn.com/bootstrap/3.0.0/css/bootstrap.min.css', false ,'3.0.0');
  // Loads our main stylesheet.
  wp_enqueue_style('style',get_stylesheet_directory_uri().'/css/swiper.min.css');
  wp_enqueue_style('style', get_stylesheet_directory_uri() . '/style.css', array('bootstrapwp') ,true);
  

  wp_enqueue_script('swiper-js',get_template_directory_uri().'./js/swiper.min.js');
  wp_enqueue_script('swiperjs',get_template_directory_uri().'./js/script.js', array('jquery') ,true);
}
add_action('wp_enqueue_scripts', 'cwd_wp_bootstrap_scripts_styles');

// Register Nav Walker
require_once('nav.php');
 
function wpt_theme_setup(){
    // Nav Menus
    register_nav_menus(array(
        'bst_menu' => __('Mobile Menu')
    ));
}
 
add_action('after_setup_theme', 'wpt_theme_setup');

?>