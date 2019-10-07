<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo( 'charset' ); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?php wp_title( '|', true, 'right' ); bloginfo('name'); ?></title>
  <link rel="profile" href="http://gmpg.org/xfn/11">
  <link rel="pingback" href="<?php bloginfo( 'pingback_url' ); ?>">
  <link rel="shortcut icon" href="<?php echo get_stylesheet_directory_uri(); ?>/favicon.ico" />
  <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<div class="container">
<h2><a href="<?php echo home_url(); ?>"><?php echo get_bloginfo('title'); ?></a></h2>
<p><?php echo get_bloginfo('description'); ?></p>
<nav id="headroom" class="navbar navbar-default" role="navigation">
  <div class="baofrom">
  	  <div class="container-fluid">
        <!-- Brand and toggle get grouped for better mobile display -->
        <div class="navbar-header">
            <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
                <span class="sr-only">Toggle navigation</span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
            </button>
            <a class="navbar-brand" href="<?php echo home_url(); ?>">
                <img src="/images/logo-m.png" alt="">
            </a>
        </div>
        <?php
        wp_nav_menu( array(
            /* Theme_location chính là phần bạn tùy chỉnh Menu cần hiển thị 
            Bạn có thể thay bằng "primary-menu" để lấy menu chính. */
            'theme_location'    => 'bst_menu',
 
            'depth'             => 2,
            'container'         => 'div',
            'container_class'   => 'collapse navbar-collapse',
            'container_id'      => 'bs-example-navbar-collapse-1',
            'menu_class'        => 'nav navbar-nav',
            'fallback_cb'       => 'WP_Bootstrap_Navwalker::fallback',
            'walker'            => new WP_Bootstrap_Navwalker())
        );
        ?>
    </div>
     <div class="header-search">
	<?php get_search_form(); ?>
 	</div>
  	
  </div>
</nav>