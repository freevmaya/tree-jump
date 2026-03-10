
class VKApp {
	requireShareCount = 3;
	_haveAd = false;
	constructor(app_id, source_user_id, source) {

		this.app_id = app_id;
		this.source = source;
		this.source_user_id = source_user_id;
		this.count_phrases = 0;
		this.sharedSession = false;

		$('body').addClass('vk_layout');

		vkBridge.send('VKWebAppGetUserInfo', {})
			.then(((user) => { 
				if (user) {
					Ajax({
						action: 'initUser',
						data: {
							source_id: source_id,
							source: source,
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

		vkBridge.send('VKWebAppCheckNativeAds', {
			ad_format: 'reward' /* Тип рекламы */ 
		})
		.then((data) => { 
			if (data.result) { 
				this._haveAd = true;
			}   
	  	})
	  	.catch((error) => { tracer.log(error); });

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
}