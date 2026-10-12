<script>
    import { createEventDispatcher, onMount } from 'svelte';
    const dispatch = createEventDispatcher();

    function close() {
        dispatch('close');
    }

    function quit() {
        if (typeof alt !== 'undefined') {
            alt.emit('exit');
        }
    }
</script>

<div class="pause-menu-overlay" on:mousedown|self={(e) => { e.preventDefault(); e.stopPropagation(); }}>
    <div class="pause-menu-container">
        <!-- Header Area -->
        <div class="header-title">gtamp</div>
        
        <div class="header-nav-container">
            <div class="header-nav">
                <div class="nav-item active">PROJECT NEWS</div>
                <div class="nav-item">SETTINGS</div>
            </div>
        </div>

        <!-- Content Area -->
        <div class="content-area">
            <!-- Right Panel: WIP Message -->
            <div class="info-panel">
                <div class="info-content">
                    <h2>WORK IN PROGRESS</h2>
                    <p class="wip-message">Project News section is not yet fully created.</p>
                    <p class="wip-subtext">Information about server updates and your character will appear here soon.</p>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    /* Scoped fonts for Svelte component */
    @import url('https://cdn.rawgit.com/mfd/09b70eb47474836f25a21660282ce0fd/raw/e06a670afcb2b861ed2ac4a1ef752d062ef6b46b/Gilroy.css');

    .pause-menu-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 9995;
        background: radial-gradient(circle, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%);
        color: white;
        font-family: 'Gilroy', Arial, sans-serif;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    
    .pause-menu-container {
        width: 80%;
        height: 80%;
        display: flex;
        flex-direction: column;
    }

    .header-title {
        font-size: 48px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 2px;
        margin-bottom: 20px;
    }

    .header-nav-container {
        display: flex;
        border-bottom: 1px solid rgba(255,255,255,0.2);
        margin-bottom: 30px;
    }

    .nav-item {
        padding: 10px 20px;
        font-size: 18px;
        font-weight: 600;
        cursor: pointer;
        opacity: 0.6;
        text-transform: uppercase;
    }

    .nav-item.active {
        opacity: 1;
        border-bottom: 3px solid white;
    }

    .content-area {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .info-panel {
        background: rgba(0, 0, 0, 0.5);
        border-radius: 8px;
        padding: 40px;
        text-align: center;
        max-width: 600px;
    }

    .info-content h2 {
        font-size: 32px;
        margin-bottom: 20px;
        color: #ffcc00;
    }

    .wip-message {
        font-size: 20px;
        margin-bottom: 10px;
    }

    .wip-subtext {
        font-size: 16px;
        opacity: 0.7;
    }
</style>
