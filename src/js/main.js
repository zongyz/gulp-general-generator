(function(){
	require.config({
		// appDir : './',
		baseUrl : '/asset/js',
		waitSeconds : 30,
		paths : {
			jquery : '../vendor/jquery/dist/jquery.min',
			bootstrap : '../vendor/bootstrap-sass/assets/javascripts/bootstrap',
		},
		shim : {
			'jquery' : {
				exports : '$'
			},
			'bootstrap' : ['jquery']
		},
		deps : ['_common']
	});
})();