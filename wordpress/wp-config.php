<?php
/**
 * Cấu hình cơ bản cho WordPress
 *
 * Trong quá trình cài đặt, file "wp-config.php" sẽ được tạo dựa trên nội dung 
 * mẫu của file này. Bạn không bắt buộc phải sử dụng giao diện web để cài đặt, 
 * chỉ cần lưu file này lại với tên "wp-config.php" và điền các thông tin cần thiết.
 *
 * File này chứa các thiết lập sau:
 *
 * * Thiết lập MySQL
 * * Các khóa bí mật
 * * Tiền tố cho các bảng database
 * * ABSPATH
 *
 * @link https://codex.wordpress.org/Editing_wp-config.php
 *
 * @package WordPress
 */

// ** Thiết lập MySQL - Bạn có thể lấy các thông tin này từ host/server ** //
/** Tên database MySQL */
define( 'DB_NAME', 'sql_wp' );

/** Username của database */
define( 'DB_USER', 'root' );

/** Mật khẩu của database */
define( 'DB_PASSWORD', '' );

/** Hostname của database */
define( 'DB_HOST', 'localhost' );

/** Database charset sử dụng để tạo bảng database. */
define( 'DB_CHARSET', 'utf8mb4' );

/** Kiểu database collate. Đừng thay đổi nếu không hiểu rõ. */
define('DB_COLLATE', '');

/**#@+
 * Khóa xác thực và salt.
 *
 * Thay đổi các giá trị dưới đây thành các khóa không trùng nhau!
 * Bạn có thể tạo ra các khóa này bằng công cụ
 * {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * Bạn có thể thay đổi chúng bất cứ lúc nào để vô hiệu hóa tất cả
 * các cookie hiện có. Điều này sẽ buộc tất cả người dùng phải đăng nhập lại.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         'qs`u3VErR1kkUCK4kDfRf:Nf=cq.VeW[E7T)2D}&olTSX@@Uo+G=GFCPJv6F|:[)' );
define( 'SECURE_AUTH_KEY',  'iHkj3Pudy$|CGK_7ls$w}O6,xf)vzr*[v yt-A:s4)Et7P7,d{F#N9n{tYJ8Y/zz' );
define( 'LOGGED_IN_KEY',    '`1p?y=g~`Wo_@Cga7FvwP_$aR1`M`D<OE1y]NvgbsfOX}%HII;_U%dfb#iLB]p0W' );
define( 'NONCE_KEY',        '|AN=0MIH2?-7MAEIbsu(^YG?)#tNRX6`lDjnRu95Uie#.Xnxrs!`6t`2ifW=8p,^' );
define( 'AUTH_SALT',        'M,IJ5(OR!Zta2`!gB9SdPVP b<!|X;(mY,p/l8PVxfQ8CIVVn=wZP~*2JXP)++*J' );
define( 'SECURE_AUTH_SALT', 'j]0f-wPBV^T#^*-)Ix33#QB^2k7;r^>/b-ijK~Z1-p5h_ZD,~wfEw(cHPFRPL<b)' );
define( 'LOGGED_IN_SALT',   'i  ,G}TfOPDu<UnTD;[RC<IkR:oXe;h,,Ac3(|3M;9N7qw`(muHffjzv6V(;c^o,' );
define( 'NONCE_SALT',       'nKAQ=NRxS#i[>RkiHI{$M6/^MD<B;tRA#]S&r_$KvCYz|z-T9uCkkH,JDmt.Jqqn' );

/**#@-*/

/**
 * Tiền tố cho bảng database.
 *
 * Đặt tiền tố cho bảng giúp bạn có thể cài nhiều site WordPress vào cùng một database.
 * Chỉ sử dụng số, ký tự và dấu gạch dưới!
 */
$table_prefix  = 'wp_';

/**
 * Dành cho developer: Chế độ debug.
 *
 * Thay đổi hằng số này thành true sẽ làm hiện lên các thông báo trong quá trình phát triển.
 * Chúng tôi khuyến cáo các developer sử dụng WP_DEBUG trong quá trình phát triển plugin và theme.
 *
 * Để có thông tin về các hằng số khác có thể sử dụng khi debug, hãy xem tại Codex.
 *
 * @link https://codex.wordpress.org/Debugging_in_WordPress
 */
define('WP_DEBUG', false);

/* Đó là tất cả thiết lập, ngưng sửa từ phần này trở xuống. Chúc bạn viết blog vui vẻ. */

/** Đường dẫn tuyệt đối đến thư mục cài đặt WordPress. */
if ( !defined('ABSPATH') )
	define('ABSPATH', dirname(__FILE__) . '/');

/** Thiết lập biến và include file. */
require_once(ABSPATH . 'wp-settings.php');
