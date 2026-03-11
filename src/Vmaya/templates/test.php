<?php
    $v = SCRIPTS_VERSION;
    $is_developer = Page::isDev();
    $scripts =  [
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
      'utils/Utils',
      'effects/SparkEffect',
      'physics/BallPhysics',
      'audio/SoundManager',
      'main'
      // ... все ваши модули
    ];
?>
  <div class="loader">
      <div class="spinner-border" role="status">
      </div>
  </div>

  <!-- Bootstrap модальное окно для Start Game -->
  <div class="modal fade" id="startModal" tabindex="-1" aria-hidden="true" aria-labelledby="exampleModalLabel" data-bs-backdrop="static" data-bs-keyboard="false">
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
              <p <?=Page::isDev() ? '' : 'style="display:none"'?>>GPU speed: <span id="testResult"></span>. Version: <span><?=APP_VERSION?></span></p>
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

  <!-- Подключаем Bootstrap JS глобально -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
  <script src="https://unpkg.com/three@0.160.0/build/three.min.js"></script>
  <script src="./scripts/utils/Utils.js"></script>

  <script>
    $(window).ready(()=>{
      $('body').addClass('page-loaded');

      let startModal = new bootstrap.Modal($('#startModal'), {
        backdrop: 'static',
        keyboard: false
      });

      startModal.show();
    });
  </script>

  <?if (DEV) {?>
    <script type="module" src="<?=BASEURL?>/scripts/test-unit.js?v=<?=$v?>"></script>
    <!-- Eruda is console for mobile browsers-->
    <script src="https://cdn.jsdelivr.net/npm/eruda"></script>
    <script>eruda.init();</script>
  <?}?>