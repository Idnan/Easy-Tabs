(function(){

	var tabsManager = {

		init: function() {
			tabsManager.BindUI();
		},

		BindUI: function() {

			$(window).on('ready', function(){

				$('body').on('click', '.btn', function(){
					tabsManager.decideAction(this);
				});

				$('body').on('click', '.close', function(){
					$('.pagecover').fadeOut('300', function(){
						$('.pagecover').remove();
					});
				});

				$('body').on('click', '.done', function(){
					tabsManager.pinSelectedTabs();
				});

				$('body').on('click', '.selectAll', function(){
					tabsManager.selectAllTabs(this);
				});

				$('body').on('click', '.unPinDone', function(){
					tabsManager.unpinSelectedTabs();
				});

				tabsManager.badgeText();
				tabsManager.updateHideBtnText();
			});
		},

		updateHideBtnText: function() {
			if (localStorage.length > 0) {
				$('.hideUnHide').prop('value','Unhide All Tabs');
			}
		},

		decideAction: function(_this) {
			if ($(_this).val() == "Reload All Tabs")
				tabsManager.reload_All_Tabs();

			if ($(_this).val() == "Pin Tabs")
				tabsManager.pin_All_Tabs();

			if ($(_this).val() == "Unpin Tabs")
				tabsManager.unpin_All_Tabs();

			if ($(_this).val() == "Hide All Tabs")
				tabsManager.Hide_All_Tabs();

			if ($(_this).val() == "Unhide All Tabs")
				tabsManager.Unhide_All_Tabs();
		},

		reload_All_Tabs: function() {
			chrome.tabs.query({}, function(tabs){
				for (var i = tabs.length - 1; i >= 0; i--) {
					chrome.tabs.reload(tabs[i].id);
				};
			});
		},

		pin_All_Tabs: function() {
			chrome.tabs.query({'pinned': false}, function(tabs){
				$("<div><span class='close'>X</span></div>").addClass('pagecover').hide().appendTo('body').fadeIn('300');

				$("<div class='selectAllChkbxContainer'><span class='tabChkbx'><input type='checkbox' class='selectAll' id='chkG'/></span><span class='tabTitle'><label for='chkG'>Select All</label></span></div>").appendTo('.pagecover');
				var tabsList = "<div class='tabItemsContainer'>";
				for (var i = tabs.length - 1; i >= 0; i--) {
					// if (tabs[i].title == "New Tab" || tabs[i].title == "Extensions" || tabs[i].title == "Downloads" || tabs[i].title == "Downloads" || tabs[i].title == "History" || tabs[i].title == "Settings" || tabs[i].title == "Bookmark Manager" || tabs[i].title == "Loading...")
					// 	continue;
					tabsList += "<div class='tabItem'><span class='tabChkbx'><input type='checkbox' value='"+ tabs[i].id +"' /></span><span class='tabTitle'>" + tabs[i].title + "</span></div>";
				}

				tabsList += "</div>";

				$(tabsList).appendTo('.pagecover');
				$("<button>Done</button>").addClass('done').appendTo('.pagecover');
			});
		},

		unpin_All_Tabs: function() {
			chrome.tabs.query({'pinned': true}, function(tabs){
				$("<div><span class='close'>X</span></div>").addClass('pagecover').hide().appendTo('body').fadeIn('300');

				$("<div class='selectAllChkbxContainer'><span class='tabChkbx'><input type='checkbox' id='chkG' class='selectAll'/></span><span class='tabTitle'><label for='chkG'>Select All</label></span></div>").appendTo('.pagecover');
				var tabsList = "<div class='tabItemsContainer'>";
				for (var i = tabs.length - 1; i >= 0; i--) {
					tabsList += "<div class='tabItem'><span class='tabChkbx'><input type='checkbox' value='"+ tabs[i].id +"' /></span><span class='tabTitle'>" + tabs[i].title + "</span></div>";
				}

				tabsList += "</div>";

				$(tabsList).appendTo('.pagecover');
				$("<button>Done</button>").addClass('unPinDone').appendTo('.pagecover');
			});
		},

		pinSelectedTabs: function() {
			$('.tabItemsContainer').find('input[type=checkbox]:checked').each(function(){
				chrome.tabs.update(parseInt($(this).val()), {'pinned': true});
			});

			$('.close').trigger('click');
		},

		unpinSelectedTabs: function() {
			$('.tabItemsContainer').find('input[type=checkbox]:checked').each(function(){
				chrome.tabs.update(parseInt($(this).val()), {'pinned': false});
			});

			$('.close').trigger('click');
		},

		selectAllTabs: function(_this) {
			var chk = $(_this).is(':checked');
			if (chk) {
				$('.tabItemsContainer').find('input[type=checkbox]').each(function(){
					$(this).prop('checked', true);
				});
			} else {
				$('.tabItemsContainer').find('input[type=checkbox]').each(function(){
					$(this).prop('checked', false);
				});
			}
		},

		Hide_All_Tabs: function() {
			chrome.tabs.query({}, function(tabs){
				for (var i = tabs.length - 1; i >= 0; i--) {
					localStorage["site"+i] = tabs[i].url;
				}
				tabsManager.badgeText();
				tabsManager.closeAllTabs();
			});
		},

		badgeText: function() {
			chrome.browserAction.setBadgeText({"text": localStorage.length.toString()});
		},

		closeAllTabs: function() {
			chrome.tabs.query({}, function(tabs){
				// array to store the tab ids that we are going to close
				var tabsList = new Array();
				for (var i = tabs.length - 1; i >= 0; i--) {
					tabsList[i] = tabs[i].id;
				}

				// creating new tabs
				tabsManager.createNewTab();
				// closing the tabs
				chrome.tabs.remove(tabsList);
				//now close the extension window
				window.close();
			});
		},

		createNewTab: function() {
			chrome.tabs.create({});
		},

		Unhide_All_Tabs: function() {
			for (var i = localStorage.length - 1; i >= 0; i--) {
				chrome.tabs.create({url: localStorage["site"+i].toString()});
			}

			tabsManager.clearLocalStorage();
			tabsManager.badgeText();
		},

		clearLocalStorage: function() {
			localStorage.clear();
		}

	};

	tabsManager.init();

	chrome.commands.onCommand.addListener(function(command) {
	  	if (command == "toggle_pin") {
	    	// Get all tabs
	    	chrome.tabs.query({currentWindow: true}, function(tabs) {
	      		// Toggle the pinned status
	      		for (var i = tabs.length - 1; i >= 0; i--) {
	      			var current = tabs[i];
	      			chrome.tabs.update(current.id, {'pinned': !current.pinned});
	      		}
	    	});
	  	}
	  	else if (command == "reload_All") {
	  		chrome.tabs.query({currentWindow: true}, function(tabs) {
	      		// Reload all tabs
	      		for (var i = tabs.length - 1; i >= 0; i--) {
	      			var current = tabs[i];
	      			chrome.tabs.reload(current.id);
	      		}
	    	});
	  	}
	  	else if (command == "hide_all") {
	  		tabsManager.Hide_All_Tabs();
	  	}
	  	else if (command == "unhide_all") {
	  		tabsManager.Unhide_All_Tabs();
	  	}
	});

})();