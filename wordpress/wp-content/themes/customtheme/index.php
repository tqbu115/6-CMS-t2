<?php
get_header();
if ( have_posts() ) :
	while ( have_posts() ) : the_post(); ?>
	<article class="post">
		<h2><a href="<?php the_permalink() ?>"><?php the_title() ?></a></h2>
		<?php $post_meta_value = get_post_meta( $post->ID, 'test_meta_block_field', true );
		echo 'Email is: ' .$post_meta_value ;
		?>
		<?php the_content() ?>
	</article>
<?php endwhile;
else :
	echo '<p>There are no posts!</p>';
endif;
get_footer();
?>
