
class VKApp {
	requireShareCount = 3;
	constructor(app_id, source_user_id, source) {

		this.last_show_adv = performance.now();
		this.app_id = app_id;
		this.source = source;
		this.source_user_id = source_user_id;
		this.sharedSession = false;

		$('body').addClass('vk_layout');

		vkBridge.send('VKWebAppGetUserInfo', {})
			.then(((user) => { 
				if (user) {
					Ajax({
						action: 'initUser',
						data: {
							source_id: this.source_user_id,
							source: this.source,
							user_data:  user
						}
					}).then((data)=>{
						if (data) {
							this.user_id = data.user_id;
							localStorage.setItem('user_id', data.user_id);

							if (data.redirect)
								document.location.href = data.redirect;
						} else localStorage.setItem('user_id', null);
					});
				}
			}).bind(this));

	  	this.initListeners();
	}

	callApi(method, params, callback) {
		vkBridge.send('VKWebAppCallAPIMethod', {
			method: method,
			params: params
		})
		.then((data) => { 
			if (data.response)
				callback(data);
		})
		.catch((error) => {
			tracer.log(error);
		});
	}

	initListeners() {
		When(()=>{
			return window.game;
		})
		.then(()=>{
			window.game.advProvider = () => {
				return new Promise((resolve, reject)=>{
					let dt = (performance.now() - this.last_show_adv) / 1000;
					if (dt > 60) {
						this.showAd()
							.then((result) => {
								setTimeout(()=>{
									resolve(result);
								}, 1000);
							});
					} else resolve(true);
		      });
		    }
		});
	}



	shareApp(message) {
		return new Promise((resolve, reject)=>{
			vkBridge.send('VKWebAppShare', {
				text: message
			})
			.then((data)=>{
				let items = data.result || data.items;
				if (items && items.length)
					resolve(items);
				else {
					tracer.error(data);
					reject(data);
				}
			})
			.catch((e)=>{
				tracer.error(e);
				reject(e);
			});
		});
	}

	showAd() {
		return new Promise((resolve, reject) => {
			vkBridge.send('VKWebAppCheckNativeAds', {
				ad_format: 'reward' /* Тип рекламы */ 
			})
			.then((data) => { 
				if (data.result) { 
					vkBridge.send('VKWebAppShowNativeAds', {
						ad_format: 'interstitial' /* Тип рекламы */
					})
					.then((data) => { 
						// Реклама была показана
						resolve(data.result)
					})
					.catch((error) => { 
						tracer.log(error);
						resolve(false);
					});
				} else resolve(false);
		  	})
		  	.catch((error) => { 
		  		tracer.log(error);
		  		resolve(false);
		  	});
		});
	}
}