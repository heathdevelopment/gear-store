jQuery( function($) {
	$(document).ready( function() {

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
									
										content += '<select id = "wnw-gear-item-sizes">';
											content += '<option value="">Size</option>';
											decoded_response[i]['sizes'].forEach(function(element) {
												content += '<option value="'+element+'">'+element+'</option>';
											});										
										content += '</select>';
									
								}
									content += '<select id= "wnw-gear-item-quantity">';
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
								content += '<a class="wnw-ad-to-cart" href="javascript:void(0);"><p class="gear-cart-button">Add to Cart</p></a>';
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