<?
class Ajax extends BaseAjax {

	public function getActionWithoutToken() {
		return ['getUserState'];
	}
	
	protected function setValue($data) {
		$result = false;
		if ($nameModel 	= @$data['model']) {
			$id 		= @$data['id'];
			$model = new ($nameModel)();
			if ($item = $model->getItem($data['id'])) {

				$item[$data['name']] = $data['value'];
				$result = $model->Update($item);
			}
		}
		return $result;
	}

	protected function initUser($data) {
		GLOBAL $dbp;

		if (!isset($data['source_id']) || !isset($data['source']))
			Page::Wrong();

		$userModel = new UserModel();
		$source = $dbp->safeVal($data['source']);
		$source_id = intval($data['source_id']);
		$user_data = $data['user_data'] ?? [];

		if (in_array($source, SOURCES) && $source_id) {

			$language = isset($user_data['language_code']) ? $user_data['language_code'] : Page::language();

			$values = [
				'source_id'=>$source_id,
				'source'=>$source,
				'first_name'=>$user_data['first_name'] ?? '',
				'last_name'=>$user_data['last_name'] ?? '',
				'last_time'=>date('Y-m-d H:i:s'),
				'language_code'=> $language
			];

	    	$items = $userModel->getItems("source_id = {$source_id} AND source = '{$source}'");

	    	//Если нашли пользователя
	    	if (count($items) > 0) {
	    		$values['id'] = $user_id = $items[0]['id'];

	    		if (!$items[0]['data'])
	    			$values['data'] = json_encode($user_data, JSON_FLAGS);

	    		$userModel->Update($values);

				if ($source == 'site') { // Если это пользователь сайта

					$session_user_id = Page::getSession('user_id');

					if ($session_user_id && ($session_user_id != $user_id)) {

						$session_user = $userModel->getItem($session_user_id);
						//Удаляем если был создан временный пользователь
						if ($session_user && ($session_user['source'] == 'site')) {
							$userModel->Delete($session_user_id);
						}
					}
				}

	    	} else {
	    		$values['data'] = json_encode($user_data, JSON_FLAGS);
	    		$user_id = $userModel->Update($values);
	    	}

	    	$this->setUser($userModel->getItem($user_id));
	    	Page::setSession('user_id', $user_id);

	    	$result = [
				'user_id'=>intval($user_id)
			];

    		if (Page::getSession('language', $language) != $language) {
    			Page::setSession('language', $language);
    			$result['redirect'] = BASEURL.'?lang='.$language;
    		}

			return $result;
		} else Page::Wrong();
	}

	protected function getUserState($data) {
		GLOBAL $_SESSION;
		
		if ($user_id = Page::getSession('user_id')) {
    		if ($stateItem = (new UserStateModel())->getItem($user_id, 'user_id')) {
    			
    			if ($json_data = trim($stateItem['data']))
	    			return [
	    				'state' => json_decode($json_data, true)
	    			];
    		}
			return 0;
		}

		trace_error($_SESSION);
		Page::Wrong();
	}

	protected function setUserState($data) {
		if ($user_id = Page::getSession('user_id')) {
			$data = json_encode($data, JSON_FLAGS);
			return [
				'success'=> ((new UserStateModel())->Update([
					    			'user_id'=>$user_id,
					    			'data' => $data
					    		], 'user_id')) ? true : false
			];
		} 
		Page::Wrong();
	}

	protected function addError($data) {
		$model = new ErrorsModel();
		if (isset($data['id']))
			unset($data['id']);

		$data['col'] = isset($data['column']) ? intval($data['column']) : 0;
		$data['user_id'] = Page::getSession('user_id', 0);
		return [
			'success'=> $model->Update($data) ? true : false
		];
	}

	protected function vk_apiCall($data) {

		if ($user_id = Page::getSession('user_id', 0)) {

			$url = "https://api.vk.com/method/".$data['method'];
			unset($data['method']);

			if ($user = (new UserModel())->getItem($user_id)) {

				$params = array_merge($data, [
				    'access_token' => VK_APP_SERVER_SECRET,
				    'user_id' => $user['source_id'],
				    'v' => '5.199'
				]);

				// Инициализируем cURL
				$ch = curl_init();

				// Настройки cURL
				curl_setopt($ch, CURLOPT_URL, $url);
				curl_setopt($ch, CURLOPT_POST, 1);
				curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));
				curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
				curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Для локальной разработки, на продакшене лучше true
				curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false); // Для локальной разработки

				// Выполняем запрос
				$response = curl_exec($ch);

				// Проверяем на ошибки
				if (curl_error($ch)) {
				    trace_error('Ошибка cURL: ' . curl_error($ch)."\nParams: ".json_encode($params));
				} else {
				    $result = json_decode($response, true);
				    
				    if (isset($result['error'])) {
				        trace_error('Ошибка API: ' . $result['error']['error_msg'] . ' (Код: ' . $result['error']['error_code'] . ')'."\nParams: ".json_encode($params));
				    } else {
				        return $result;
				    }
				}
			}
		}

		Page::Wrong();
	}
}
?>