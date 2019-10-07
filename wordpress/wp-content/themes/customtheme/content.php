<div style="width:70%; float:left">
 
 <?php $getposts = new WP_Query(array(
 'post_type'=>'post',
 'post_status'=>'publish',
 'orderby' => 'ID',
 'order' => 'DESC')); ?>
 
 <?php while ($getposts->have_posts()) : $getposts->the_post();?>
 
 <?php the_post_thumbnail(full,array( "title" => get_the_title(),"alt" => get_the_title(),"class" => "class-img" ));?>
 <h2><?php the_title();?></h2>

 <p><?php the_excerpt();?></p>
 <a href="<?php the_permalink() ;?>">Xem thêm</a>
 
 <?php endwhile ; wp_reset_query() ;?>
 
 
</div>