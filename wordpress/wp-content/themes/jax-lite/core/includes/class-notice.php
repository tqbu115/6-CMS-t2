<?php

/**
 * This source file is subject to the GNU GENERAL PUBLIC LICENSE (GPL 3.0)
 * that is bundled with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * http://www.gnu.org/licenses/gpl-3.0.txt
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
} // Exit if accessed directly

if( !class_exists( 'jax_lite_admin_notice' ) ) {

	class jax_lite_admin_notice {
	
		/**
		 * Constructor
		 */
		 
		public function __construct( $fields = array() ) {

			if ( 
				!get_option( 'jax-lite-dismissed-notice') &&
				version_compare( PHP_VERSION, JAX_LITE_MIN_PHP_VERSION, '>=' )
			) {

				add_action( 'admin_notices', array(&$this, 'admin_notice') );
				add_action( 'admin_head', array( $this, 'dismiss' ) );
			
			}

		}

		/**
		 * Dismiss notice.
		 */
		
		public function dismiss() {

			if ( isset( $_GET['jax-lite-dismiss'] ) && check_admin_referer( 'jax-lite-dismiss-action' ) ) {
		
				update_option( 'jax-lite-dismissed-notice', intval($_GET['jax-lite-dismiss']) );
				remove_action( 'admin_notices', array(&$this, 'admin_notice') );
				
			} 
		
		}

		/**
		 * Admin notice.
		 */
		 
		public function admin_notice() {
			
		?>
			
            <div class="notice notice-warning is-dismissible">
            
            	<p>
            
            		<strong>

						<?php
                        
                            esc_html_e( 'Upgrade to the premium version of Jax, to enable 600+ Google Fonts, Unlimited sidebars, Portfolio section and much more. ', 'jax-lite' ); 
                            
							printf( 
								'<a href="%1$s" class="dismiss-notice">' . esc_html__( 'Dismiss this notice', 'jax-lite' ) . '</a>', 
								esc_url( wp_nonce_url( add_query_arg( 'jax-lite-dismiss', '1' ), 'jax-lite-dismiss-action'))
							);
                            
                        ?>
                    
                    </strong>
                    
            	</p>
                    
            	<p>
            		
                    <a target="_blank" href="<?php echo esc_url( 'https://www.themeinprogress.com/jax-free-responsive-creative-wordpress-theme/?ref=2&campaign=jax-notice' ); ?>" class="button button-primary"><?php esc_html_e( 'Upgrade to Jax Premium', 'jax-lite' ); ?></a>
                
            	</p>

            </div>
		
		<?php
		
		}

	}

}

new jax_lite_admin_notice();

?>