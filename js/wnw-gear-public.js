jQuery( function($) {
	$(window).ready( function() {
		var global_user_logged_in = false;
		var global_user_id = 0;

		function check_user_gear_member() {

			var check_user = {
				'action': 'check_valid_user'
			}

			$.ajax({
				data: check_user,
				url: ajax_url,
				type: 'get',
				success: function(response) {

					var decoded_response = JSON.parse(response);

					if (decoded_response['code'] == "1") {
						console.log('user logged in for gear store');
						global_user_logged_in = true;
						global_user_id = decoded_response['id'];
					} else {
						global_user_logged_in = false;
					}
					console.log(decoded_response['code']);
				}, error: function(error) {

				}
			});
		}

		check_user_gear_member();

	

		//handle add to cart button
		$('#wnw-store').on('click', '[id^=wnw-gear-item-]', function(e) {

			console.log('clicked fired');
			console.log('Globel user logged in.' + global_user_logged_in);
			if(global_user_logged_in) {
				//add item to the cart

				//Does this product have a size?
				var data_id = $(this).attr('data-id');

				console.log($(this).parent().siblings().find('#wnw-gear-item-sizes-'+data_id).length);

				if($(this).parent().siblings().find('#wnw-gear-item-sizes-'+data_id).length) {
					//product has a size make sure the customer selected one.

					var choosen_size = $(this).parent().siblings().find('#wnw-gear-item-sizes-'+data_id).val();
					

					if(choosen_size == "") {

						console.log('Choose size empty');
						$('.wnw-ad-text-size-'+data_id).show();

						$('#wnw-gear-item-sizes-'+data_id).on('change', function() {
							$('.wnw-ad-text-size-'+data_id).hide();
						});

					} else {
						//product includes a price, check for quantity
						if($(this).parent().siblings().find('#wnw-gear-item-quantity-'+data_id).length) {
							//product has quantity option, make sure its has one

							var choosen_quantity = $(this).parent().siblings().find('#wnw-gear-item-quantity-'+data_id).val();
						

							if(choosen_quantity == "") {
								//must choose a quanitity
								$('.wnw-ad-text-quantity-'+data_id).show();

								$('#wnw-gear-item-quantity-'+data_id).on('change', function() {
									console.log('change found.');
									$('.wnw-ad-text-quantity-'+data_id).hide();
								});

							} else {
								//size and quantity included
								 wnw_add_product_to_cart( data_id, global_user_id, choosen_quantity, choosen_size).done( function(response) {

								 	var decoded_response = JSON.parse(response);
									var cart_id = decoded_response['cart_id'];

									if( cart_id != -1 ) {
										console.log('refreshing car count');
										console.log('cart id' + cart_id);
										wnw_refresh_cart_count( cart_id );
									} else {
										console.log('Product being added: cart id' + cart_id);
										alert('Item cannot be added, contact support.');
									}
								});
								
							}
						}
					}


				} else {
					//product doesn't contain a size option
					//product includes a price, check for quantity
					console.log('No size found.');
					console.log($(this).parent().siblings().find('#wnw-gear-item-quantity-'+data_id).length);
						if($(this).parent().siblings().find('#wnw-gear-item-quantity-'+data_id).length) {
							//product has quantity option, make sure its has one

							var choosen_quantity = $(this).parent().siblings().find('#wnw-gear-item-quantity-'+data_id).val();
						

							if(choosen_quantity == "") {
								//must choose a quanitity
								$('.wnw-ad-text-quantity-'+data_id).show();

								$('#wnw-gear-item-quantity-'+data_id).on('change', function() {
									console.log('change found.');
									$('.wnw-ad-text-quantity-'+data_id).hide();
								});

							} else {
								//no size and quantity included
								 wnw_add_product_to_cart( data_id, global_user_id, choosen_quantity, 0).done( function(response) {

								 	var decoded_response = JSON.parse(response);
									var cart_id = decoded_response['cart_id'];

									if( cart_id != -1 ) {
										console.log('refreshing car count');
										console.log('cart id' + cart_id);
										wnw_refresh_cart_count( cart_id );
									} else {
										console.log('Product being added: cart id' + cart_id);
										alert('Item cannot be added, contact support.');
									}
								});
							
							}
						}
				}

				//accepts product id
				
				//update the count in the store
				//wnw_refresh_store_count();
			} else {
				//reveal div that user must be logged in
				console.log('user not logged in click');
				var data_id = $(this).attr('data-id');
				$('.wnw-ad-text-login-'+data_id).show('slow', 'swing');
			}

		});


		$('#wnw-credit-button').toggle(function(){
			//first click
			$( ".wnw-payment-forms" ).show('slow');
    		$('.wnw-payment-form-credit').show('slow');
			$('.arrow-up-credit').show('slow');
		}, function() {
			$( ".wnw-payment-forms" ).hide('slow');
    		$('.wnw-payment-form-credit').hide('slow');
			$('.arrow-up-credit').hide();

		});

		$(document).on('click', '#wnw-cart-delete-item', function() {
			console.log('click');
			var item_number = $(this).data('item-id');
			var cart_id = $(this).data('cart-id');

			var del_item_data = {
				action: 'wnw_delete_cart_item',
				cart_id: cart_id,
				item_number: item_number
			}

			$.ajax({
				data: del_item_data,
				url: ajax_url,
				type: 'post',
				success: function( response ) {
					var decoded_response = JSON.parse(response);
					console.log(decoded_response);
					window.location.reload();
				}, failure: function( error ) {
					console.log( error );
				}
			});
			console.log(cart_id);
			console.log(item_number);
		});

		$(document).one('click', '[id^=wnw-cart-quantity-]', function() {

			var original_text = $(this).text();
			console.log(original_text);
			var input_text = '<select id="wnw-quantity-select">';

			for(var i = 0; i < 21; i++) {

				if( parseInt(original_text) == i ) {
					//same value as clicked make selected
					input_text += '<option selected value="' + i +'">'+i+'</option>';
				} else {
					input_text += '<option value="' + i +'">'+i+'</option>';
				}
				
			}
			input_text += '</select>';
			$(this).empty();
			$(this).append(input_text);

		


		});
			$(document).one('blur', '#wnw-quantity-select', function() {
				//console.log
				console.log($("#wnw-quantity-select option:selected" ).text());

				var qty_to_update = $("#wnw-quantity-select option:selected" ).text();
				console.log(qty_to_update);
				$(this).parent().empty().append('<p>'+qty_to_update+'</p>');
				
			});
		




		function myFunction() {

		  var x = document.getElementById("myDIV");
		  if (x.style.display === "none") {
		    x.style.display = "block";
		  } else {
		    x.style.display = "none";
		  }
	   }

		



		//add product to cart
		function wnw_add_product_to_cart( data_id, global_user_id, quantity, size ) {

			console.log($('#wnw-gear-item-'+data_id+' .gear-cart-button').text());
			$('#wnw-gear-item-'+data_id+' .gear-cart-button').text('');
			$('#wnw-gear-item-'+data_id).find('.gear-cart-button').addClass('wait');

			$('#preloader-3-'+data_id).show();

			var data = {
				action: 'wnw_add_product',
				product_id: data_id,
				gear_member_id: global_user_id,
				quantity: quantity,
				size: size
			}

			return $.ajax({
				url: ajax_url,
				data: data,
				type: 'post',
				success: function( response ){

					$('#preloader-3-'+data_id).hide();
					$('#wnw-gear-item-'+data_id+' .gear-cart-button').text('Add to Cart');
					$('#wnw-gear-item-'+data_id).find('.gear-cart-button').removeClass('wait');
				},
				failure: function(){

				}
			});

			
		}

		//refresh store count update
		function wnw_refresh_cart_count( cart_id ) {

			var data = {
				action: 'wnw_get_cart_count',
				cart_id: cart_id
			}

			$.ajax({
				data: data,
				url: ajax_url,
				type: 'get',
				success: function(response) {
					var decoded_response = JSON.parse(response);
					console.log(response);
					console.log('decoded cart count returned: ' +decoded_response['cart_count']);
					wnw_update_ui_store_count( decoded_response['cart_count'] );
				}, failure: function(error) {
					alert(error);
				}
			});
	
		}

		//update UI for store count
		function wnw_update_ui_store_count( current_count ) {

			if( current_count >= 1) {
				$('.wnw-cart-count').text( current_count );
				//show the count if it hasn't been displayed yet
				$('.wnw-cart-count').show();
			} else {
				//hide blip if empty
				$('.wnw-cart-count').hide();
			}
		
		}
	
		console.log('made it in');

		var data = {
			'action': 'fetch_store_items'
		}

		$.ajax({
			data: data,
			url: ajax_url,
			type: 'get',
			success: function(response) {
				var decoded_response = JSON.parse(response);
				var content = "";

				
                for (i = 0; i < decoded_response.length; i += 1) {
					console.log(decoded_response);
					content += '<div class="wnw-gear-store-item-holder grid-item-store">';
						content += '<div class="grid-item-row">';
							content += '<div class="grid-item-details">';
								content += '<div class="grid-top-details">';
								content += '<h3 class="wnw-gear-title">'+ decoded_response[i]['title'] +'</h3>';
								content += '<h4 class="wnw-gear-sub-title">'+ decoded_response[i]['sub_title'] +'</h4>';

								if( decoded_response[i]['dollar_price'] && decoded_response[i]['points_value'] ) {
									content += '<p class="gear-price-text">$'+ decoded_response[i]['dollar_price'] +' -or- '+ decoded_response[i]['points_value'] +' Points</p>';
								} else {
									content += '<p class="gear-price-text">$'+ decoded_response[i]['dollar_price']+'</p>';
								}
								content += '<p class="gear-select-boxs">';
								if( decoded_response[i]['sizes'].length > 0 ) {
									content += '<select id = "wnw-gear-item-sizes-'+decoded_response[i]['post_id']+'">';
										content += '<option value="">Size</option>';
										decoded_response[i]['sizes'].forEach(function(element) {
											content += '<option value="'+element+'">'+element+'</option>';
										});										
									content += '</select>';									
								}
									content += '<select id= "wnw-gear-item-quantity-'+decoded_response[i]['post_id']+'">';
										content += '<option value="">Quantity</option>';
										content += '<option value="1">1</option>';
										content += '<option value="2">2</option>';
										content += '<option value="3">3</option>';
										content += '<option value="4">4</option>';
										content += '<option value="5">5</option>';
										content += '<option value="6">6</option>';
										content += '<option value="7">7</option>';
										content += '<option value="8">8</option>';
										content += '<option value="9">9</option>';
										content += '<option value="10">10</option>';
									content += '</select>';

								content +='</p>';
								content += '</div>';
								content += '<div class="wnw-product-wrapper">';
									content += '<a class="wnw-ad-to-cart" id="wnw-gear-item-'+decoded_response[i]['post_id']+'" href="javascript:void(0);" data-id="'+decoded_response[i]['post_id']+'">';
										content += '<p class="gear-cart-button">Add to Cart </p>';
									content += '</a>';
									content += '<div id="preloader-3-'+decoded_response[i]['post_id']+'">';
										content += '<span></span>';
									content += '</div>';
									content += '<div class="wnw-ad-text-login-'+decoded_response[i]['post_id']+'">You Must Be Logged In. <a href="/wp-login.php/">Sign in</a>.</div>';
									content += '<div class="wnw-ad-text-size-'+decoded_response[i]['post_id']+'">Choose A Size For The Item.</div>';
									content += '<div class="wnw-ad-text-quantity-'+decoded_response[i]['post_id']+'">Choose A Quantity</div>';
								content += '</div>';
							content += '</div>';

							content += '<div class="wnw-gear-product-image">';
								content += '<img src= "'+ decoded_response[i]['product_image_url']+'">';
							content += '</div>';
						content += '</div>'; //end of row
					content += '</div>';
				}

				$('.wnw-gear-store-items-list').append( content );
			},
			failure: function( error ) {
				console.log(error);
			}
		});

	});
});