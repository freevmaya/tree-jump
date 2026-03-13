const TITLE_MISSION_IDS = {
	Novice: 0,
	Warrior: 3,
	Knight: 4,
	Lord: 5,
	Legend: 6
}

class VKApp {
	requireShareCount = 3;
	constructor(app_id, source_user_id, source) {

		this.last_show_adv = 0;
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

	getToken(scope, callback) {
		vkBridge.send('VKWebAppGetAuthToken', { 
				app_id: this.app_id, 
				scope: scope,
				append_local: this.source == 'ok'
			})
			.then( (data) => { 
				if (data.access_token)
					callback(data.access_token);
				else if (data.local_access_token)
					callback(data.local_access_token);
			})
			.catch( (error) => {
				// Ошибка
				tracer.log(error);
			});
	}

	callApi(method, params, callback) {
		vkBridge.send('VKWebAppCallAPIMethod', {
			method: method,
			params: {...{v: '5.199'}, ...params}
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
					let current = performance.now();
					let dt = (current - this.last_show_adv) / 1000;
					if (dt > 30) {
						this.last_show_adv = current;
						this.showAd()
							.then((result) => {
								setTimeout(()=>{
									resolve(result);
								}, 200);
							});
					} else resolve(true);
		      });
		    }
		});


    	eventBus.on('set_user_title', this.onNewTitle.bind(this));
	}

	onNewTitle(key) {
		/*
		if (TITLE_MISSION_IDS[key]) {
			Ajax({
				action: 'vk_apiCall',
				data: {
					method: 'secure.addAppEvent',
					activity_id: TITLE_MISSION_IDS[key]
				}
			}, (data)=>{
				tracer.log(data);
			});
		}*/
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