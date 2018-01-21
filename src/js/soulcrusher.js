
/* Profile page */
function swapInLargeProfileImage(){
	var $img = jQuery(".profile-photo img");
	$img.prop('src', $img.prop('src').replace(/largest\.jpg$/, 'original.jpg'));
}

function moveH1IntoProfileSummary(){
	jQuery("h1").detach().prependTo($(".profile-summary"));
}

if(jQuery(".profile ").length){
	swapInLargeProfileImage();
	moveH1IntoProfileSummary();
}



/* Listing page */

function swapInLargeListingImage($listing){
	var $img = $listing.find(".photo-frame-medium .photo-frame-image");
	$img.prop('src', $img.prop('src').replace(/largest\.jpg$/, 'original.jpg'));
}

function makeProfileLinkOpenInNewTab($listing){
	$listing.find("a").prop("target", "_blank");
}


function addHideButtonToProfileListing($listing){
	var html = '<span class="photo-frame-action button button-tertiary soulcrusher-additional-action" data-href="/ajax/hide/PROFILE_ID?_=TIMESTAMP">';
			html += '<span>Hide</span>';
			html += '<svg class="icon icon-hide" viewBox="0 0 1 1" role="presentation" aria-hidden="true">';
				html += '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="/static/images/icons.svg#icon-hide"></use>';
			html += '</svg>';
		html += '</span>';
	var $overlay = $listing.find(".photo-frame-overlay");
	var profile_id = getProfileID($listing);
	var user_specific_html = html.replace("PROFILE_ID", profile_id);
	var $button = jQuery(user_specific_html);
	// Sometimes the existing 'Like' button (which we're placing this above) has got a
	// 'button-small' class and sometimes it doesn't (depending on the page)
	if($overlay.find(".photo-frame-action.button-small").length){
		$button.addClass("button-small");
	}
	$button.prependTo($overlay);
}

function getProfileID($element){
	// Given a ".user-grid-item" element or any element within it (as a jQuery object), return the
	// profile ID
	var $item, url;
	if($element.is(".user-grid-item")){
		$item = $element;
	}else{
		$item = $element.closest(".user-grid-item");
	}
	// Look for the hash value in the link's href
	return $item.find("a").eq(0).prop("href").match(/[a-f0-9]{24}/)[0];
}

function additionalHideButtonClick(e){
	// Click handler for the added 'Hide' buttons on the profile listings.
	// Send off Ajax call to hide the profile, and then grey out the profile in the listing.
	var $this = $(this);
	var url = $this.data("href").replace("TIMESTAMP", String((new Date()).getTime()));
	$.get(url);
	// Nicely grey out the listing on the page.
	var $item = $this.closest(".user-grid-item");
	$item.animate({"opacity": "0.2"}, 200);
	return false;
}

function pollForProfilesList(){
	// The listing pages load in results by Ajax, so we have to check for results arriving in the
	// DOM and then trigger events on them - they're not in the DOM to start with
	var $listings = jQuery(".user-grid-item:not(.soulcrushed)");
	if($listings.length){
		$listings.each(function(){
			var $this = $(this);
			swapInLargeListingImage($this);
			makeProfileLinkOpenInNewTab($this);
			// For some reason we have to wait a moment before this works!
			// The elements are there and we can inject stuff, but it gets removed
			setTimeout(addHideButtonToProfileListing, 600, $this);
			console.log("profile listings upgraded");
		});
		$listings.addClass("soulcrushed");
	}else{
		console.log("NO profile listings to upgrade");
		setTimeout(pollForProfilesList, 150);
	}
}

function isListingsPage(){
	// Do we expect the current page to have profile listings on it?  (They get added by Ajax.)
	var patterns = [/^\/$/, /^\/find/];
	var path = document.location.pathname;
	for(var i=0; i<patterns.length; i++){
		var pattern = patterns[i];
		if(pattern.test(path)){
			return true;
		}
	}
	return false;
}

if(isListingsPage()){
	pollForProfilesList();
	// Bind the click handlers for the 'Hide' buttons which we will inject into the page
	jQuery(document).on("click", ".soulcrusher-additional-action", additionalHideButtonClick);
	// If the user clicks the 'Next' or "Prev" buttons or the menu items (on the home page), then
	// re-trigger the polling for profiles to update, as it will probably pull more into the page
	jQuery(document).on("click", ".carousel-nav-prev, .carousel-nav-next, .drop-tab-list-item-link", pollForProfilesList)
}




