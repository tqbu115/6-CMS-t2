<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the
 * installation. You don't have to use the web site, you can
 * copy this file to "wp-config.php" and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * MySQL settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://codex.wordpress.org/Editing_wp-config.php
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'sq;_wp' );

/** MySQL database username */
define( 'DB_USER', 'root' );

/** MySQL database password */
define( 'DB_PASSWORD', '' );

/** MySQL hostname */
define( 'DB_HOST', 'localhost' );

/** Database Charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The Database Collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         'Ju}0X7@0hdI[KK0bWG56KPfRD9F;{TD{B-1,qqq{[775{Fa/~C;@,F{;-MD~u#g~' );
define( 'SECURE_AUTH_KEY',  'u,5/Bh-kgm]fek79?HgiH{c{$T01tnYf(;x6sy!@Lw;5&7St4Oyv5tG=X,N.af-^' );
define( 'LOGGED_IN_KEY',    'N3b9<1kmw9hrwsIC0}#O;G,wQ m%Jh8oV0d(d.,@(jn`@QF_ddM&OP+a?-)JHVd;' );
define( 'NONCE_KEY',        '+o>Q)ngG}E5yk~u5F?g{cA|lei1ds|jk:03)-uU: R1^-F@~rsJ$He tV^FlR8[3' );
define( 'AUTH_SALT',        'o7R@LusJY>i/Bnm&a,!0:Qt #Xu7`%y$=y4BKt/|8x+t5_gUO-8-BFRwS/>%ANct' );
define( 'SECURE_AUTH_SALT', 'U&Z&<U-0uQNiN=1X4-:s_59XJSq #sDz%D*H4|Dta&b{_p}dk,J=SW}t(T8B-m`Y' );
define( 'LOGGED_IN_SALT',   '9=g_.c+-%~Yi=De5G:]kQGM-B#VJt)SdMjY7)5Br6v6=SlfEi+ae:Hm,F,spC,2v' );
define( 'NONCE_SALT',       '48=+QpTz HX+C 5Gn{{14c-z b5CUHti@@IuM~<PfKm%kS}jA-Tq&ssnsv*7.Rg!' );

/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the Codex.
 *
 * @link https://codex.wordpress.org/Debugging_in_WordPress
 */
define( 'WP_DEBUG', false );

/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', dirname( __FILE__ ) . '/' );
}

/** Sets up WordPress vars and included files. */
require_once( ABSPATH . 'wp-settings.php' );
