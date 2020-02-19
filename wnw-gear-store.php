<?php
 
/*
Plugin Name: Where And When - Gear Store
Description: enables store front for the ambassadors section of whereandwhen.
Author: Matthew Heath 
Version: 1.0
Author URI: https://github.com/heathdevelopment
*/

function wnw_gear_enqueue_scripts() {
	//register script
	wp_enqueue_script('wnw-gear-js', plugin_dir_url(__FILE__).'/js/wnw-gear-public.js', array('jquery'), '1.0');

	wp_localize_script('wnw-gear-js', 'ajax_url', admin_url('admin-ajax.php'));

	wp_enqueue_style('wnw-gear-style', plugin_dir_url(__FILE__).'/css/wnw-gear-public.css', array(), '1.0');
}

add_action('wp_enqueue_scripts', 'wnw_gear_enqueue_scripts');

//custom post type
function create_gear_product_post_type() {
	register_post_type('wnw-product',
		array(
			'labels' => array(
				'name' => __('Gear Products'),
				'singular_name' => __('Gear Product')
			),
			'public' => true,
			'has_archive' => true, 
    		'supports' => array('title')
		)
	);
}
add_action( 'init', 'create_gear_product_post_type');

//add custom image for products admin
add_filter('manage_wnw-product_columns', 'add_img_column');
add_filter('manage_wnw-product_column', 'manage_img_column', 10, 2);

function add_img_column($columns) {
  $columns = array_slice($columns, 0, 1, true) + array("img" => "Featured Image") + array_slice($columns, 1, count($columns) - 1, true);
  return $columns;
}

function manage_img_column($column_name, $post_id) {
 if( $column_name == 'img' ) {
 	$url = get_field('wnw_product_image', $post_id);
  echo '<img src="'.$url.'">';
 }
 return $column_name;
}

function fetch_store_items_callback() {

	$results = array();

	$args = array(
		'post_type' => 'wnw-product',
		'post_status' => 'publish',
		'posts_per_page' => -1
	);

	$gear_query = new WP_Query( $args );

	if($gear_query->have_posts()) {
		while($gear_query->have_posts()) {
			$gear_query->the_post();
			//set up variables
			$title = get_the_title();
			$post_id = get_the_ID();
			$sub_title = get_field('wnw_gear_product_sub_title', $post_id);
			$dollar_price = get_field('wnw_gear_price', $post_id);
			$points_value = get_field('wnw_gear_points_value', $post_id);
			$stock_number = get_field('wnw_stock_count', $post_id);
			$product_image_url = get_field('wnw_product_image', $post_id);
			$sizes = array();

			$rows = get_field('wnw_gear_size_options');
			if($rows)
			{
				foreach($rows as $row)
				{
					$sizes[] = $row['wnw_gear_size'];
				}			
			}

			$result[] = array (
		          "title"         => $title,
		          "post_id"       => $post_id,
		          "sub_title"     => $sub_title,
		          "dollar_price"  => $dollar_price,
		          "points_value"  => $points_value,
		          "stock_number"  => $stock_number,
		          "product_image_url" => $product_image_url,
		          'sizes' => $sizes		    
		      ); 
		}
	}

	echo json_encode($result);
	die();
}
add_action('wp_ajax_nopriv_fetch_store_items', 'fetch_store_items_callback');
add_action('wp_ajax_fetch_store_items', 'fetch_store_items_callback');









