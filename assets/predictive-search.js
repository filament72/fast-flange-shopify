/**
 * https://shopify.dev/api/ajax/reference/predictive-search
 * https://shopify.dev/api/liquid/objects/predictive-search
 * https://shopify.dev/themes/navigation-search/search
 * https://shopify.dev/api/liquid/objects/search
 * https://help.shopify.com/en/manual/online-store/storefront-search
 */

(function($) {
	"use strict";

	var $window = $(window),
		$document = $(document),
		$html = $('html'),
		$body = $('body'),
		page_type = T4Srequest.page_type,
		search_url = T4Sconfigs.enablePredictiveSearch ? T4Sroutes.predictive_search_url : T4Sroutes.search_url,
		cacheNameFirst = T4SThemeSP.cacheNameFirst,
		isTouch = ('ontouchstart' in window) || window.DocumentTouch && window.document instanceof DocumentTouch || window.navigator.maxTouchPoints || window.navigator.msMaxTouchPoints ? true : false,
		hasSearchTerms = 'has--search-terms',
		dataKey = 'data-key';

	var predictiveSearch = (function() {

		function predictiveSearch(container) {

			this.container = container;
			this.$container = $(container);
			this.deferRequestBy = 300;
			this.cachedResults = {};
			this.$form = this.$container.find('[data-frm-search]');
			this.form = this.$form[0];
			this.$input = this.$container.find('[data-input-search]');
			this.input = this.$input[0];
			this.$results = this.$container.find('[data-results-search]');
			this.results = this.$results[0];
			this.$skeleton = this.$container.find('[data-skeleton-search]');
			this.$formListkey = this.$form.find('[data-listkey-search]');
			this.$listSuggest = this.$form.find('[data-listsuggest-search]');
			this.listSuggest = this.$listSuggest[0];
			this.isOpen = false;
			this.sectionID = this.$container.attr('data-sid') || 'predictive-search';
			this.$title = this.$container.find('[data-title-search]');
			this.title = this.$title[0];
			this.$viewall = this.$container.find('[data-viewAll-search]');
			this.viewall = this.$viewall[0];
			this.$select = this.$container.find('[data-cat-search]>select');
			this.select = this.$select[0];
			this.currentVal = this.$select.val() || '*';
			this.hasClassTerms = false;
			this.searchUrlForm = this.$form.serialize();
			this.setupEventListeners();
			this.onClickKey();
		}

		predictiveSearch.prototype = Object.assign({}, predictiveSearch.prototype, {

			setupEventListeners: function() {
				//console.log(this)
				this.form.addEventListener('submit', this.onFormSubmit.bind(this));
				const submit = this.form.querySelector('[type="submit"]');
				if (!submit) this.$form.append('<button type="submit" class="t4s-d-none"></button>');

				this.input.addEventListener('input', this.debounce((event) => {
					this.onChange(event);
				}, this.deferRequestBy).bind(this));

				this.input.addEventListener('focus', this.onFocus.bind(this));

				if (this.select) {
					this.select.addEventListener('change', this.onChangeSelectCat.bind(this));
					this.$input.after('<input type="search" data-input-q name="q" value="" class="t4s-mini-search__input t4s-d-none">')
					this.input.removeAttribute('name');
					this.$input_q = this.$container.find('[data-input-q]');
					this.input.addEventListener('input', event => {
						this.$input_q.val(this.getQuery());
					});
				}

				this.container.addEventListener('focusout', this.onFocusOut.bind(this));
				this.container.addEventListener('keyup', this.onKeyup.bind(this));
				this.container.addEventListener('keydown', this.onKeydown.bind(this));
				//console.log(this)
			},

			debounce: function(fn, wait) {
				let t;
				return (...args) => {
					clearTimeout(t);
					t = setTimeout(() => fn.apply(this, args), wait);
				};
			},

			getQuery: function() {

				var currentValue = this.input.value.trim();
				if (this.select) {
					var valSelected = this.currentVal.trim();
					//console.log(valSelected)
					if (valSelected != '*') {
						currentValue = `product_type:${valSelected} AND ${currentValue}`;
						// currentValue = currentValue + ' AND product_type:'+valSelected
					}
				}

				return currentValue;
			},

			onChange: function() {
				const searchTerm = this.getQuery();
				if (!searchTerm.length) {
					this.close(true);
					if (this.hasClassTerms) {
						this.form.classList.remove(hasSearchTerms);
						this.hasClassTerms = false;
					}
					this.$results.hide();
					this.$viewall.hide();
					this.$skeletonElement.hide();
					return;
				}
				this.getSearchResults(searchTerm);
				if (!this.hasClassTerms) {
					this.form.classList.add(hasSearchTerms);
					this.hasClassTerms = true;
				}
			},

			onFormSubmit: function(event) {
				const queryLength = this.getQuery().length;
				if (!queryLength || (queryLength && this.container.querySelector('[aria-selected="true"] a')) ) event.preventDefault();
			},

			onFocus: function() {
				const searchTerm = this.getQuery();

				if (!searchTerm.length) return;

				if (this.container.getAttribute('results') === 'true') {
					this.open();
				} else {
					this.getSearchResults(searchTerm);
				}
			},

			onChangeSelectCat: function() {

				this.currentVal = this.$select.val();

				const searchTerm = this.getQuery();

				// if (!searchTerm.length) return;
				this.getSearchResults(searchTerm);
			},

			onClickKey: function() {
				var self = this,
					myTimeout;

				self.$container.find('[data-listKey]').on('click', `[${dataKey}]`, function(e) {
					e.preventDefault();

					var $this = $(this);

					if (isTouch) {
						self.$input.val($this.attr(dataKey));
					} else {
						self.$input.val($this.attr(dataKey)).focus();
						self.$container.addClass('showing--results');
						clearTimeout(myTimeout);
						myTimeout = setTimeout(function() {
							self.$container.removeClass('showing--results');
						}, 1500);
					}
					self.input.dispatchEvent(new Event('input', {
						bubbles: true
					}));

				});

				self.$form.on('click', '[data-clear-search]', function(e) {
					e.preventDefault();

					//var $this = $(this);

					self.$input.val('');
					// self.form.classList.remove(hasSearchTerms);
					// self.hasClassTerms = false;
					self.input.dispatchEvent(new Event('input', {
						bubbles: true
					}));
					//self.$results.hide();

				});

				// focus input on desktop
				self.$container.on('opendDrawer', function(e) {

					if (isTouch) return;
					//console.log(self.$input)
					$(this).one('transitionend webkitTransitionEnd oTransitionEnd', function() {
						self.$input.focus();
					});

				});

			},

			onFocusOut: function() {
				setTimeout(() => {
					if (!this.container.contains(document.activeElement)) this.close();
				})
			},

			onKeyup: function(event) {
				if (!this.getQuery().length) this.close(true);
				event.preventDefault();

				switch (event.code) {
					case 'ArrowUp':
						this.switchOption('up')
						break;
					case 'ArrowDown':
						this.switchOption('down');
						break;
					case 'Enter':
						// this.selectOption();
						break;
				}
			},

			onKeydown: function(event) {
				// Prevent the cursor from moving in the input when using the up and down arrow keys
				if (event.code === 'ArrowUp' || event.code === 'ArrowDown') {
					event.preventDefault();
				}
			},

			switchOption: function(direction) {
				if (!this.container.getAttribute('open')) return;

				const moveUp = direction === 'up';
				const selectedElement = this.results.querySelector('[aria-selected="true"]');
				const allElements = this.results.querySelectorAll('li');
				let activeElement = this.results.querySelector('li');

				if (moveUp && !selectedElement) return;

				// this.statusElement.textContent = '';

				if (!moveUp && selectedElement) {
					activeElement = selectedElement.nextElementSibling || allElements[0];
				} else if (moveUp) {
					activeElement = selectedElement.previousElementSibling || allElements[allElements.length - 1];
				}

				if (activeElement === selectedElement) return;

				activeElement.setAttribute('aria-selected', true);
				if (selectedElement) selectedElement.setAttribute('aria-selected', false);

				this.setLiveRegionText(activeElement.textContent);
				this.input.setAttribute('aria-activedescendant', activeElement.id);
			},

			// selectOption: function() {

			// 	const selectedProduct = this.container.querySelector('[aria-selected="true"] a, [aria-selected="true"] button, .t4s-mini-search__viewAll');

			// 	if (selectedProduct) selectedProduct.click();
			// },

			getSearchResults: function(searchTerm) {
				if (!searchTerm.length) {     
          this.$skeletonElement.hide();
          this.$results.hide().html('');
          this.$viewall.hide();
          this.$formListkey.hide();
          this.$title.hide();
          this.container.removeAttribute('loading');
          return;
        }
				const queryKey = searchTerm.replace(" ", "-").toLowerCase();
				this.setLiveRegionLoadingState();

				if (this.cachedResults[queryKey]) {
					this.renderSearchResults(this.cachedResults[queryKey]);
					return;
				}
				//`${search_url}/suggest?q=${encodeURIComponent(searchTerm)}&${encodeURIComponent('resources[type]')}=product&${encodeURIComponent('resources[limit]')}=5&section_id=${this.sectionID}`

				fetch(`${search_url}/?${this.searchUrlForm}${encodeURIComponent(searchTerm)}&section_id=${this.sectionID}`)
					.then((response) => {
						if (!response.ok) {
							var error = new Error(response.status);
							this.close();
							throw error;
						}

						return response.text();
					})
					.then((text) => {
						const resultsMarkup = new DOMParser()
							.parseFromString(text, 'text/html').querySelector(`#shopify-section-${this.sectionID}`).innerHTML;
						this.cachedResults[queryKey] = resultsMarkup;
						this.renderSearchResults(resultsMarkup);
					})
					.catch((error) => {
						this.close();
						throw error;
					});
			},

			setLiveRegionLoadingState: function() {
				this.$skeletonElement = this.statusElement || this.$skeleton;

				this.$skeletonElement.show();
				this.$results.hide();
				this.$formListkey.hide();
				this.$viewall.hide();
				// this.$title.hide();
				this.container.setAttribute('loading', true);
			},

			renderSearchResults: function(resultsMarkup) {

				// this.title = this.container.querySelector('[data-title-search]');
				// this.viewall = this.container.querySelector('[data-viewAll-search]');

				var resultsMarkupDOM = new DOMParser().parseFromString(resultsMarkup, 'text/html')
				if (this.title) this.title.innerHTML = resultsMarkupDOM.querySelector('[data-title-search]').innerHTML;
				if (this.results) this.results.innerHTML = resultsMarkupDOM.querySelector('[data-results-search]').innerHTML;
				if (this.listSuggest) this.listSuggest.innerHTML = resultsMarkupDOM.querySelector('[data-listsuggest-search]').innerHTML;

				try {
					this.viewall.innerHTML = resultsMarkupDOM.querySelector('[data-viewAll-search]').innerHTML;
				} catch (err) {}
				if (typeof T4SThemeSP.reinitProductGridItem == "function") T4SThemeSP.reinitProductGridItem();
				$body.trigger('currency:update');

				this.container.setAttribute('results', true);

				this.setLiveRegionResults();
				this.open();
			},

			setLiveRegionResults: function() {
				this.$skeletonElement.hide();
				this.$results.show();
				this.$viewall.show();
				this.$formListkey.show();
				this.$title.show();
				this.container.removeAttribute('loading');
			},

			getResultsMaxHeight: function() {
				this.resultsMaxHeight = window.innerHeight - document.querySelector('.t4s-section-header').getBoundingClientRect().bottom;
				return this.resultsMaxHeight;
			},

			open: function() {
				this.results.style.maxHeight = this.resultsMaxHeight || `${this.getResultsMaxHeight()}px`;
				this.container.setAttribute('open', true);
				this.input.setAttribute('aria-expanded', true);
				this.isOpen = true;
			},

			close: function(clearSearchTerm = false) {
				if (clearSearchTerm) {
					this.input.value = '';
					this.container.removeAttribute('results');
				}

				const selected = this.container.querySelector('[aria-selected="true"]');

				if (selected) selected.setAttribute('aria-selected', false);

				this.input.setAttribute('aria-activedescendant', '');
				this.container.removeAttribute('open');
				this.input.setAttribute('aria-expanded', false);
				this.resultsMaxHeight = false
				this.results.removeAttribute('style');

				this.isOpen = false;
			}

		});

		return predictiveSearch;

	})();

	T4SThemeSP.predictiveSearchInt = function() {

		//initPredictiveSearch();
		initFetch();

		// Reload drawer html 
		function initFetch() {

			var key_time = 'timeSearchT4s' + cacheNameFirst,
				key_data = 'dataSearchT4s' + cacheNameFirst,
				timeCache = isStorageSpSession ? (sessionStorage.getItem(key_time) || 0) : 0,
				timeCache = parseInt(timeCache),
				timeConfig = 400 * 60000, // convert 400 minute to milliseconds
				$search = $('#t4s-search-hidden');

			if (timeCache > 0 && timeCache >= Date.now()) {
				// T4SThemeSP.$appendComponent.after( sessionStorage.getItem(key_data) );
				// removeDataDelay();
				// initPredictiveSearch();
				T4SThemeSP.Helpers.promiseStylesheet(T4Sconfigs.stylesheet4).then(
					function() {

						$search.html(sessionStorage.getItem(key_data));
						initPredictiveSearch();
						if (typeof T4SThemeSP.reinitProductGridItem == "function") T4SThemeSP.reinitProductGridItem();
					}
				);
			} else {
				T4SThemeSP.getToFetchSection('?section_id=search-hidden').then((section) => {
					if (section == 'NVT_94') return;
					// T4SThemeSP.$appendComponent.after( section );
					//  removeDataDelay();
					// initPredictiveSearch();
					// if (isStorageSpSession) {
					//    timeCache = Date.now() + timeConfig;
					//    sessionStorage.setItem(key_time, timeCache);
					//    sessionStorage.setItem(key_data, section);
					// }
					T4SThemeSP.Helpers.promiseStylesheet(T4Sconfigs.stylesheet4).then(
						function() {
							$search.html($(section).html());
							initPredictiveSearch();
							if (typeof T4SThemeSP.reinitProductGridItem == "function") T4SThemeSP.reinitProductGridItem();
							if (isStorageSpSession) {
								timeCache = Date.now() + timeConfig;
								sessionStorage.setItem(key_time, timeCache);
								sessionStorage.setItem(key_data, $(section).html());
							}

						}
					);
				});
			}
			// fetch( T4SThemeSP.root_url+'?section_id=search-hidden', {
			//  method: 'GET',
			//  headers: { 'Cache-Control': 'no-cache' }
			// })
			// .then((response) => response.text())
			// .then((section) => {
			//    T4SThemeSP.$appendComponent.after( section );
			//     removeDataDelay();
			//  initPredictiveSearch();
			// })
			// .catch((e) => { });


		}

		function initPredictiveSearch() {
			$('[data-predictive-search]:not(is--inted)').each(function() {
				$(this).addClass('is--inted');
				this.predictiveSearch = new predictiveSearch(this);
			});
		}

		// function removeDataDelay() {
		//    $('[data-drawer-options*="#t4s-search-hidden"]').removeAttr('data-drawer-delay');
		// }

	};

})(jQuery_T4NT);

jQuery_T4NT(document).ready(function($) {
	T4SThemeSP.predictiveSearchInt();
});