<div id="sidebar-wrapper">
	
	<div id="scroll-sidebar" class="clearfix">
    
		<div class="navigation"><i class="fa fa-times open"></i></div>	

		<div class="wrap">

            <div class="post-article">
    
                <div class="title-container">
                	<h3 class="title"><?php esc_html_e('Menu','jax-lite');?></h3>
                </div>
        
                <nav id="widget-menu" class="custommenu">
                
                    <?php 
                                                    
                        wp_nav_menu( array(
                            'theme_location' => 'main-menu',
                            'container' => 'false',
                            'menu_id' => 'widgetmenus'
                        )); 
                    
                    ?>
    
                </nav>                
            
            </div>
    
            <?php 
    
                if ( is_active_sidebar( jaxlite_sidebar_name('scroll')) ) : 
                
                    dynamic_sidebar( jaxlite_sidebar_name('scroll') );	
                
                endif;
                
            ?>
            
            <div class="post-article">
    
                <div class="copyright">
                        
                    <p>
                    
                        <?php 
                        
                            if ( jaxlite_setting('jaxlite_copyright_text')): 
                                
                                echo stripslashes(jaxlite_setting('jaxlite_copyright_text'));
                                
                            else:
                            
                                echo esc_html__('Copyright ','jax-lite') . esc_html(get_bloginfo("name")) . " " . date("Y");
                            
                            endif; 
                                
                            echo " | " . esc_html__('Theme by','jax-lite'); 
                        ?> 
                        
                            <a href="<?php echo esc_url('https://www.themeinprogress.com/'); ?>" target="_blank"><?php esc_html_e('ThemeinProgress','jax-lite');?></a> |
                            <a href="<?php echo esc_url('http://wordpress.org/'); ?>" title="<?php esc_attr_e( 'A Semantic Personal Publishing Platform', 'jax-lite' ); ?>" rel="generator"><?php printf( esc_html__( 'Proudly powered by %s', 'jax-lite' ), 'WordPress' ); ?></a>
                        
                    </p>
                            
                </div>
    
                <?php do_action('jaxlite_socials'); ?>
    
            </div>
        
		</div>
	    
	</div>

</div>