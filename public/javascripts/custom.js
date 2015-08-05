


$(document).ready(function(){

		$(window).resize(function(){
			if($(window).width() >= 767){
				$(".sidebar").slideDown('350');
			}
			else{
				$(".sidebar").slideUp('350');
			}
		});
	
	 $(".navigation a").click(function(){
	  
		if(!$(this).hasClass("dropy")) {
			// hide any open menus and remove all other classes
			$(".sidebar").slideUp('350');
			$(".navigation a").removeClass("dropy");
			
			// open our new menu and add the dropy class
			$(".sidebar").slideDown('350');
			$(this).addClass("dropy");
		}
		else if($(this).hasClass("dropy")) {
			$(this).removeClass("dropy");
			$(".sidebar").slideUp('350');
		}
	});
	var editor;
	KindEditor.ready(function(k) {
		editor = k.create('textarea', {
			allowImageUpload: true,
			uploadJson : '../ken/upload_json.jsp',
			extraFileUploadParams : {
                item_id : 1000,
                category_id : 1
            },
			items: [
			'fontname', 'fontsize', '|', 'forcecolor', 'hilitecolor', 'bold', 'italic', 
			'underline', 'removeformat', '|', 'justifyleft', 'justifycenter', 'justifyright', 
			'insertorderedlist', 'insertunorderedlist', '|', 'emoticons', 'image', 'link']
		});
	});
	$('.carousel').carousel();

	var $nav = $('ul.nav li a'), pathname = window.location.pathname;
	$nav.each(function(index) {
		if (pathname === '/' || pathname === "") {
			$nav.first().parent('li').addClass('active');
			return;
		} else {
			if (new RegExp(pathname).test($(this).attr('href'))) {
				$(this).parent('li').addClass('active');
			}
		}
	});
});

	
	$('.service-item').waypoint(function(down) {
		$(this).addClass('animation');
		$(this).addClass('fadeInUp');
	}, { offset: '70%' });
	
	
	$('.feature-item').waypoint(function(down) {
		$(this).addClass('animation');
		$(this).addClass('fadeInUp');
	}, { offset: '70%' });
	
	$('.testimonial-content').waypoint(function(down) {
		$(this).addClass('animation');
		$(this).addClass('fadeInUp');
	}, { offset: '70%' });

	/* Scroll to Top */


	  $(".totop").hide();

	  $(function(){
		$(window).scroll(function(){
		  if ($(this).scrollTop()>300)
		  {
			$('.totop').slideDown();
		  } 
		  else
		  {
			$('.totop').slideUp();
		  }
		});

		$('.totop a').click(function (e) {
		  e.preventDefault();
		  $('body,html').animate({scrollTop: 0}, 500);
		});

	  });
  
