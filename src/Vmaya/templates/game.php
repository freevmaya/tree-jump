<?php
    $v = SCRIPTS_VERSION;
    $is_developer = Page::isDev();
?>

  <!-- Основной контейнер игры -->
  <div id="game-container" class="start-blocking">

    <div class="game-ui">
      <div class="game-top">
        <div id="game-title" class="status"></div>
      </div>
      <div class="hint" id="game-hint">
        <i class="bi bi-mouse"></i> Нажмите и тяните, чтобы вращать дерево
      </div>

      <!-- Индикатор очков (только при победе) -->
      <div class="score-indicator" id="score-indicator">
        <i class="bi bi-trophy-fill"></i> Счет: <span id="current-score">0</span>
      </div>
    </div>
    
    <div id="game-canvas-container">
      <div id="canvas-container"></div>
    </div>
  </div>

  <!-- Bootstrap модальное окно для Start Game -->
  <div class="modal fade" id="startModal" tabindex="-1" aria-labelledby="startModalLabel" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
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
                <i class="bi bi-info-circle"></i> Управляйте вращением дерева, чтобы шарик отскакивал от платформ
              </p>
              <p>
                <i class="bi bi-exclamation-triangle-fill"></i> Красные платформы смертельны при ударе сверху!
              </p>
              <p <?=DEV ? '' : 'style="display:none"'?>>GPU speed: <span id="testResult"></span></p>
              <div class="text-center">
                <button type="button" class="btn" id="startGameButton">Начать</button>
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
  <div class="modal fade" id="gameOverModal" tabindex="-1" aria-labelledby="startModalLabel" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog modal-dialog-centered">
      <div class="dialog-1 modal-content">
        <div class="background">
        </div>
        <div class="wrapper">
          <div class="top">
            
          </div>
          <div class="middle">
            <div class="dialog-content">
              <p class="status">Неудача!</p>
              <div class="stats-container">
                <div class="row">
                  <div class="col-12">
                    <div class="stat-value" id="finalBounceCount">0</div>
                    <div class="stat-label">Отскоков</div>
                  </div>
                </div>
              </div>
              <div class="text-center">
                <button type="button" class="btn" id="restartButton">Продолжить</button>
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
  <div class="modal fade" id="victoryModal" tabindex="-1" aria-labelledby="startModalLabel" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog modal-dialog-centered">
      <div class="dialog-1 modal-content">
        <div class="background">
        </div>
        <div class="wrapper">
          <div class="top">
            
          </div>
          <div class="middle">
            <div class="dialog-content">
              <p class="modal-subtitle status">
                Вы достигли вершины дерева!
              </p>
              <!-- Статистика игры -->
              <div class="stats-container victory-stats" id="victoryState">
                <div class="row">
                  <div class="col-6">
                    <div class="stat-value" id="victoryBounceCount">0</div>
                    <div class="stat-label">Отскоков</div>
                  </div>
                  <div class="col-6">
                    <div class="stat-value" id="victoryScore">0</div>
                    <div class="stat-label">Очки</div>
                  </div>
                </div>
              </div>

              <div class="text-center">
                <button type="button" class="btn" id="victoryRestartButton">Продолжить</button>
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
  <div class="modal fade" id="pauseModal" tabindex="-1" aria-labelledby="startModalLabel" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog modal-dialog-centered">
      <div class="dialog-1 modal-content">
        <div class="background">
        </div>
        <div class="wrapper">
          <div class="top">
            
          </div>
          <div class="middle">
            <div class="dialog-content">
              <p class="status">Игра приостановлена</p>
              <div class="text-center">
                <button type="button" class="btn" id="resumeButton">Продолжить</button>
                <button type="button" class="btn" id="pauseRestartButton">Новая игра</button>
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
  <script type="text/javascript" src="<?=BASEURL?>/scripts/utils/crypto-js.min.js"></script>
  
  <!-- Import maps для Three.js -->
  <script type="importmap">
  {
    "imports": {
      "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
      "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/",
      "@scripts/": "./scripts/"
    }
  }
  </script>
  
  <!-- Main script -->
  <script type="module" src="<?=BASEURL?>/scripts/main.js?v=<?=$v?>"></script>

  <?if (DEV) {?>
    <script type="module" src="<?=BASEURL?>/scripts/test-unit.js?v=<?=$v?>"></script>
    <!-- Eruda is console for mobile browsers-->
    <script src="https://cdn.jsdelivr.net/npm/eruda"></script>
    <script>eruda.init();</script>
  <?}?>