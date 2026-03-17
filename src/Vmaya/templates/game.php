<?php
    $v = SCRIPTS_VERSION;
    $is_developer = Page::isDev();
    $scripts =  [
      'utils/Utils',
      'languages/Lang',
      'constants',
      'GameState',
      'core/RendererManager',
      'core/CameraController',
      'core/state-manager',
      'models/Tree',
      'models/Ball',
      'models/Branch',
      'models/Platform',
      'models/RotatePlatform',
      'models/KillerPlatform',
      'models/MagicPlatform',
      'models/Needle',
      'models/Crystal',
      'models/Background',
      'models/Grass',
      'models/Ground',
      'controls/MouseRotationControl',
      'utils/EventEmitter',
      'utils/TextureLoader',
      'utils/MathUtils',
      'utils/crypto-js.min',
      'effects/SparkEffect',
      'effects/BounceEffect',
      'physics/BallPhysics',
      'audio/SoundManager',
      'main'
    ];
?>
  <div class="loader">
      <div class="spinner-border" role="status">
      </div>
  </div>

  <!-- Основной контейнер игры -->
  <div id="game-container" class="start-blocking">

    <div class="game-ui">
      <div class="game-top">
        <div id="game-title" class="status"></div>
      </div>
      <div class="game-bottom">
        <div class="left">
        </div>
        <div>
          <div class="s-view" id="state-score">
            <div class="status" data-lang="score_label">Счет</div>
            <div class="value">123</div>
          </div>
          <div class="s-view" id="state-vin">
            <div class="status" data-lang="wins_label">Поб.</div>
            <div class="value">123</div>
          </div>
          <div class="s-view" id="state-title">
            <div class="status" data-lang="title_label">Зван.</div>
            <div class="value">Рекрут</div>
          </div>
        </div>
        <div class="right">
        </div>
      </div>

      <div class="hint" id="game-hint">
        <i class="bi bi-mouse"></i> <span data-lang="game_hint_mouse">Нажмите и тяните, чтобы вращать дерево</span>
      </div>

      <div id="tools">
        <span id="pause-btn" data-lang="pause">Пауза</span>
        <span id="volume" class="on">
          <i class="bi bi-volume-down"></i>
          <i class="bi bi-volume-mute"></i>
        </span>
      </div>

      <!-- Индикатор очков (только при победе) -->
      <div class="score-indicator" id="score-indicator">
        <i class="bi bi-trophy-fill"></i> <span data-lang="score_indicator">Счет:</span> <span id="current-score">0</span>
      </div>
    </div>
    
    <div id="game-canvas-container">
      <div id="canvas-container"></div>
    </div>
  </div>

  <!-- Bootstrap модальное окно для Start Game -->
  <div class="modal fade" id="startModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog modal-dialog-centered">
      <div class="dialog-1 modal-content">
        <div class="background">
        </div>
        <div class="wrapper">
          <div class="top">
            
          </div>
          <div class="middle">
            <div class="dialog-content">
              <p>
                <i class="bi bi-info-circle"></i> <span data-lang="start_info_1">Управляйте вращением дерева, чтобы шарик отскакивал от платформ</span>
              </p>
              <p>
                <i class="bi bi-exclamation-triangle-fill"></i> <span data-lang="start_info_2">Красные платформы смертельны при ударе сверху!</span>
              </p>
              <p <?=Page::isDev() ? '' : 'style="display:none"'?>>
                <span data-lang="gpu_speed">GPU speed:</span> <span id="testResult"></span>. 
                <span data-lang="version">Version:</span> <span><?=APP_VERSION?></span>
              </p>
              <div class="text-center">
                <button type="button" class="btn" id="startGameButton" data-lang="start_button">Начать</button>
              </div>
            </div>
          </div>
          <div class="bottom">
            
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Bootstrap модальное окно для Game Over -->
  <div class="modal fade" id="gameOverModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog modal-dialog-centered">
      <div class="dialog-1 modal-content">
        <div class="background">
        </div>
        <div class="wrapper">
          <div class="top">
            
          </div>
          <div class="middle">
            <div class="dialog-content">
              <p class="status" data-lang="game_over_title">Неудача!</p>
              <div class="stats-container">
                <div class="row">
                  <div class="col-12">
                    <div class="stat-value" id="finalBounceCount">0</div>
                    <div class="stat-label" data-lang="game_over_bounces">Отскоков</div>
                  </div>
                </div>
              </div>
              <div class="text-center">
                <button type="button" class="btn" id="restartButton" data-lang="game_over_button">Продолжить</button>
              </div>
            </div>
          </div>
          <div class="bottom">
            
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Bootstrap модальное окно для Victory (Победа) -->
  <div class="modal fade" id="victoryModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog modal-dialog-centered">
      <div class="dialog-1 modal-content">
        <div class="background">
        </div>
        <div class="wrapper">
          <div class="top">
            
          </div>
          <div class="middle">
            <div class="dialog-content">
              <p class="modal-subtitle status" data-lang="victory_title">Вы достигли вершины дерева!</p>
              <p class="new-title status" data-lang="new_rank"></p>
              <!-- Статистика игры -->
              <div class="stats-container victory-stats" id="victoryState">
                <div class="row">
                  <div class="col-6">
                    <div class="stat-value" id="victoryBounceCount">0</div>
                    <div class="stat-label" data-lang="victory_bounces">Отскоков</div>
                  </div>
                  <div class="col-6">
                    <div class="stat-value" id="victoryScore">0</div>
                    <div class="stat-label" data-lang="victory_score">Очки</div>
                  </div>
                </div>
              </div>

              <div class="text-center">
                <button type="button" class="btn" id="victoryRestartButton" data-lang="victory_button">Продолжить</button>
              </div>
            </div>
          </div>
          <div class="bottom">
            
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Bootstrap модальное окно для Pause (Пауза) -->
  <div class="modal fade" id="pauseModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog modal-dialog-centered">
      <div class="dialog-1 modal-content">
        <div class="background">
        </div>
        <div class="wrapper">
          <div class="top">
            
          </div>
          <div class="middle">
            <div class="dialog-content">
              <p class="status" data-lang="pause_title">Игра приостановлена</p>
              <p><span data-lang="current_rank">Ваше текущее звание:</span> <span class="title"></span></p>
              <div class="title-image"></div>
              <div class="text-center">
                <button type="button" class="btn" id="resumeButton" data-lang="pause_resume">Продолжить</button>
                <button type="button" class="btn" id="pauseRestartButton" data-lang="pause_restart">Новая игра</button>
              </div>
            </div>
          </div>
          <div class="bottom">
            
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Подключаем Bootstrap JS глобально -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
  <script src="https://unpkg.com/three@0.160.0/build/three.min.js"></script>
  <script src="<?=SCRIPTURL?>jquery-4.0.0.min.js"></script>

  <?foreach ($scripts as $script) {?>
  <script src="<?=SCRIPTURL . $script?>.js?v=<?=$v?>"></script>
  <?}?>

  <!--<script src="<?=SCRIPTURL?>language-switcher.js?v=<?=$v?>"></script>-->

  <?if ($is_developer) {?>
    <script type="module" src="<?=BASEURL?>/scripts/test-unit.js?v=<?=$v?>"></script>
    <!-- Eruda is console for mobile browsers-->
    <script src="https://cdn.jsdelivr.net/npm/eruda"></script>
    <script>eruda.init();</script>
  <?}?>