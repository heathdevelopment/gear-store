<?php
 
/*
Plugin Name: Where And When - Gear Store
Description: enables store front for the ambassadors section of whereandwhen. Requires: When and Where - Subscribe with Authorize.net and s2Member Framework.
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

function create_gear_member_cart_post_type() {
	$args = array(
		'labels' => array(
			'name' => 'Gear Member Carts',
			'singular_name' => 'Gear Member Cart'
		),
		'public' => true,
		'has_archive' => false,
		'supports' => array('title')
	);

	register_post_type('wnw-gear-cart', $args);

}
add_action('init', 'create_gear_member_cart_post_type');

//add custom role for gear store
function wnw_custom_role_gear_store() {
	add_role('wnw_gear_store_member', 'Gear Store Member', 'access_s2member_gear_store');
}
add_action('init', 'wnw_custom_role_gear_store');

//gear store member
function create_gear_store_member_post_type() {
	$args = array(
			'labels' => array(
				'name' => 'Store Members',
				'singular_name' => 'Store Member'
			),
			'public' => true,
			'has_archive' => false,
			'supports' => array('title')
	);
	register_post_type('wnw-gear-member', $args);
}

add_action('init', 'create_gear_store_member_post_type');

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

//Function checks that the user is logged in, and has permission to add items to the cart
function wp_ajax_check_valid_user_callback() {
	$result = array(
		'code' => '',
		'id' => ''
	);

	$user = wp_get_current_user();
	error_log('User Check');
	error_log(print_r($user->roles, true));
	if ( in_array( 'wnw_gear_store_member', (array) $user->roles ) ) {
	   $result['code'] = "1";
	   $result['id'] = $user->ID;
	} else {
	   $result['code'] = "2";
	}
    echo json_encode($result);
	die();
}

add_action('wp_ajax_check_valid_user', 'wp_ajax_check_valid_user_callback');
add_action('wp_ajax_nopriv_check_valid_user', 'wp_ajax_check_valid_user_callback');

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

// get the number of items in the cart
function wnw_get_cart_count_callback() {
	$result = array(
		'cart_count' => ''
	);



	$current_cart_count = 0;
	$cart = get_field('wnw_gear_store_items_in_cart', $_GET['cart_id']);
	if (is_array($cart)) {
	  $current_cart_count = count($cart);
	  $result['cart_count'] = $current_cart_count;
	}
	

	echo json_encode($result);
	die();

}
add_action('wp_ajax_nopriv_wnw_get_cart_count','wnw_get_cart_count_callback');
add_action('wp_ajax_wnw_get_cart_count','wnw_get_cart_count_callback');

function wnw_add_product_callback() {

	$result = array(
		'code' => '',
		'cart_id' => ''
	);


	$gear_member_id = $_POST['gear_member_id'];
	$product_id = $_POST['product_id'];

	if ( (!empty($gear_member_id)) && (!empty($product_id)) ) {

		//find the users cart
		$args = array (
			'post_type' => 'wnw-gear-cart',
			'post_status' => 'publish',
			'posts_per_page' => 1,
			'meta_query' => array(
				'key' => 'wnw_customer_id_gear_store_member_id',
				'value' => $gear_member_id,
				'compare' => '='
			)
		);

		$cart_query = new Wp_Query($args);
		$cart_id = 0;
		if($cart_query->have_posts()){
			while($cart_query->have_posts()) {
				$cart_query->the_post();

				$cart_id = get_the_ID();
			}
		}

		if(!($cart_id == 0)){
			//cart id was successful updated

			//get all the product details by query product
			$price = get_field('wnw_gear_price', $product_id);
			$points_value = get_field('wnw_gear_points_value', $product_id);

			$quantity = $_POST['quantity'];
			$size = $_POST['size'];
			$product_title = get_the_title( $product_id );


			$row = array(
			    'product_title'                    => $product_title,
			    'product_dollar_value'   		   => $price,
			    'product_points_value'             => $points_value,
			    'wnw_gear_cart_product_quantity'   => $quantity,
			    'wnw_gear_cart_size'               => $size,
			    'wnw_gear_cart_product_post_id'    => $product_id
			);

			//check current cart size
			$current_cart_count = 0;
			$cart = get_field('wnw_gear_store_items_in_cart', $cart_id);
			if (is_array($cart)) {
			  $current_cart_count = count($cart);
			}
			//(int|false) The new total row count on successful update, false on failure
			$updated_count = add_row('wnw_gear_store_items_in_cart', $row, $cart_id);

			if (is_int($updated_count)) {
				if($current_cart_count < $updated_count) {
					//item added successfully
					$result['code'] = 1;
					$result['cart_id'] = $cart_id;
				} else {
					//item added successfully but cart is less the before
					$result['code'] = 4;
				}
			} else {
					//failed to add a new row to cart
					$result['code'] = 3;
			}
		}

	} else {
		$result['code'] = 2;
	}

	

	echo json_encode($result);
	die();

	//add the product

	//report result

	
}
add_action('wp_ajax_nopriv_wnw_add_product', 'wnw_add_product_callback');
add_action('wp_ajax_wnw_add_product', 'wnw_add_product_callback');


add_action("deleted_user", "delete_with_user_callback", 10, 2);

function delete_with_user_callback( $userId ) {

	//using wordpresses user id on delete, find the gear shop member and remove the data
	$args = array(
		'post_type' => 'wnw-gear-member',
		'meta_query' => array(
				'key' => 'wnw_gear_member_wordpress_user_id',
				'value' => $userId,
				'compare' => '='
				)
		);

	$delete_user_query = new WP_Query($args);

	if($delete_user_query->have_posts()) {
		while($delete_user_query->have_posts()) {
			$delete_user_query->the_post();
			//delete the Gear member
			wp_delete_post(get_the_ID(), true);
			
		}
	}

}










