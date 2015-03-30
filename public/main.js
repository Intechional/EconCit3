(function($){
	var url_base = "http://localhost:5005/"; //can use env variable?

	$.ajax(url_base, {
                type: "GET",
                success: function(response){
                    console.log(response)
                    $('#user_container').html(response);
                }
     });

})//endfile