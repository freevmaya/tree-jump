<?
class Vkok extends Page {

	protected function session_start() {
		VKSessionHandler::configureVKCookies();
		parent::session_start();
	}

	public function Render($page) {
		header("Content-Type: text/html; charset=".CHARSET);
		$filename = TEMPLATES_PATH."/vkok.php";
		if (file_exists($filename)) {
			$this->RenderIndex($filename);
		} else Page::Wrong();
	}

	protected function RenderIndex($templatePath) {
		GLOBAL $dbp, $_SESSION;

		/*
		if (DEV) { // Проверка по входным параметрам
			$request = json_decode('{
			    "page": "vkok",
			    "vk_access_token_settings": "",
			    "vk_app_id": "54476025",
			    "vk_are_notifications_enabled": "0",
			    "vk_is_app_user": "0",
			    "vk_is_favorite": "0",
			    "vk_language": "ru",
			    "vk_platform": "mobile_android",
			    "vk_ref": "apps_games_genre",
			    "vk_ts": "1773341564",
			    "vk_user_id": "285120287",
			    "sign": "ZH_gbTYebdOg3stsW3g6I3jv3fVK5sGRX72vMGe0Am4"
			}', true);

			Page::$request = $request;
		}*/

		$v 			= '?v='.SCRIPTS_VERSION;
		$userModel 	= new UserModel();
		$user_id 	= 0;
		$vkok		= Page::getRequest('vk_app_id') ?? Page::getRequest('api_id');
	    $new_user 	= false;

		if ($vkok) {

			//if (!vkVerifyParams(VK_APP_CLIENT_SECRET, Page::$request))
				//Page::Wrong();

	    	if (Page::getRequest('vk_client')  == 'ok') {
	    		$source = 'ok';
	    		$source_user_id = intval(Page::getRequest('vk_ok_user_id'));
	    	} else {
	    		$source = 'vk';
	    		$source_user_id = intval(Page::getRequest('vk_user_id') ?? Page::getRequest('viewer_id'));
	    	}
	    	
	    	$items = null;

	    	try {

	    		$item = $dbp->line("SELECT * FROM users WHERE source_id={$source_user_id} AND source ='{$source}'");

				//$items = $userModel->getItems(['source_id' => $source_user_id, 'source'=>$source]);

		    	if ($item) 
		    		$user_id = $item['id'];
		    	else {
		    		$new_user = $user_id = $userModel->Update([
		    			'source_id'=>$source_user_id,
		    			'source'=>$source,
		    			'language_code'=>DEFAULT_LANGUAGE,
		    			'last_time'=>date('Y-m-d H:i:s')
		    		]);
		    	}

	    	} catch (Exception $e) {

	    		$items = $userModel->getItems(['source_id' => $source_user_id, 'source'=>$source]);

	    		if (count($items) > 0) {

	    			$new_user = $user_id = $items[0]['id'];

	    			trace("Warning initalize user {$user_id}".
		    				"\nError: ".$e->getMessage());
	    		} else {

		    		trace_error("Error initalize user".
		    				"\nError: ".$e->getMessage());

		    		$source = 'e-'.$source;
		    		$user_id = 1;

		    		$userModel->Update([
		    			'id'=>$user_id,
		    			'source_id'=>$source_user_id,
		    			'source'=>$source,
		    			'language_code'=>DEFAULT_LANGUAGE
		    		]);
		    	}

	    	}

	    	Page::setSession('source_user', [
	    		'id' => $source_user_id,
	    		'source' => $source
	    	]);

	    	Page::setSession('user_id', $user_id);
	    } else if (DEV) {

			//Инициализация пользователя VK. Только при разработке!
			$source 	= 'vk';
			$user_data 	= json_decode(file_get_contents(BASEPATH.'/dev/vk-parameters.json'), true);

			Page::setSession('source_user', [
	    		'id' => $source_user_id = $user_data['id'],
	    		'source' => $source
	    	]);

			$items = $userModel->getItems(['source_id' => $source_user_id, 'source'=>$source]);

	    	if (count($items) > 0)
	    		$user_id = $items[0]['id'];
	    	else {
	    		$user_id = $userModel->Update([
	    			'source_id'=>$source_user_id,
	    			'source'=>$source,
	    			'language_code'=>DEFAULT_LANGUAGE,
		    		'last_time'=>date('Y-m-d H:i:s')
	    		]);
	    		$new_user = $user_id;
	    	}
	    	
	    	Page::setSession('user_id', $user_id);
	    }

	    if ($user_id) {
			$is_developer = Page::isDev();
			$content = $this->getContent(DEFAULTPAGE);
			include($templatePath);
		} else Page::Wrong();
	}
}