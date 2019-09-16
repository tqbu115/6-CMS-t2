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
define( 'DB_NAME', 'database' );

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
define( 'AUTH_KEY',         'f9CkucO+7I;i/]O8m-fC5jdb?:UYQz0Jo_EX^)5QPW<]}S1!pJ4hpEp^*#&K!*l)' );
define( 'SECURE_AUTH_KEY',  '{7Pd}<w8u@utMbz7t}Q? 7;YaXF&lxe4xa~z(yEKA)i/S_4+P/yOZ*ib<(;KOjk/' );
define( 'LOGGED_IN_KEY',    '@vsPFPuY:/<>bC}]|ydu>ya*l)! hwM8-*%hw+t?av>(3Zvx1W$C^rXmd9LaLKln' );
define( 'NONCE_KEY',        '~jMEon9$&)h5SZN*v@z9^fHWhqPVb],ii=O/RGH^yw$yS21GxD<>dZ>kX|)c4~0X' );
define( 'AUTH_SALT',        'BbAD8XrUa3W5He~(<|tD_RkX0R|?4zOnfZ&S7GWqS=:1)Qa!j9exBq~R&v+AdTA<' );
define( 'SECURE_AUTH_SALT', 'f$JR:nSp[<gI$MOsgR]hpE7&=qB^^waY^4pJP&t;sTn6PW]fK0}$pd8ga8b)?<f(' );
define( 'LOGGED_IN_SALT',   'YH?,?$#cDO3Q|LN+tn#[#Q+5<rEezO3McU~~Zk9{v^sE>R)/-l[pe[>L8@AeNT]:' );
define( 'NONCE_SALT',       '6C)by4+3O-EE:W%4i!}:U_LwiF-x+?|7Sx1GRyl+HQ4XvbK9{k6`#-dQ:bns$taa' );

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
