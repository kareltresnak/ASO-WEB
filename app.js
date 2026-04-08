const pagesData = [
    'img/1.png', 
    'img/2.png',
    'img/3.png', 
    'img/4.png', 
    'img/5.png', 
    'img/6.png',
    'img/7.png',
    'img/8.png',
    'img/9.png',
    'img/10.png',
    'img/11.png',
    'img/12.png',
    'img/13.png',
    'img/14.png',
    'img/15.png',
    'img/16.png',
    'img/17.png',
    'img/18.png',
    'img/19.png',
    'img/20.png',
    'img/21.png',
    'img/22.png'
];

class MagazineController {
    constructor(containerId, data) {
        this.container = document.getElementById(containerId);
        this.scene = document.getElementById('scene');
        this.data = data;
        this.leaves = [];
        this.currentLeafIndex = 0;
        
        this.isAnimating = false;
        this.interactionTimeout = null;
        
        this.initDOM();
        this.bindEvents();
        this.calculateScale();
    }

    calculateScale() {
        const isMobile = window.innerWidth <= 900;
        const vw = window.innerWidth * (isMobile ? 0.90 : 0.80);
        const vh = window.innerHeight * (isMobile ? 0.55 : 0.75); 

        const aspectW = 2;
        const aspectH = 1.414;

        let targetW = vw;
        let targetH = (vw / aspectW) * aspectH;

        if (targetH > vh) {
            targetH = vh;
            targetW = (vh / aspectH) * aspectW;
        }

        this.scene.style.width = `${targetW}px`;
        this.scene.style.height = `${targetH}px`;
    }

    initDOM() {
        const normalizedData = [...this.data];
        if (normalizedData.length % 2 !== 0) normalizedData.push('');
        
        const totalLeaves = normalizedData.length / 2;
        const shadow = document.createElement('div');
        shadow.className = 'book-shadow';
        this.container.appendChild(shadow);
        
        for (let i = 0; i < totalLeaves; i++) {
            const leaf = document.createElement('div');
            leaf.className = 'leaf';
            leaf.style.zIndex = totalLeaves - i;

            const frontImage = normalizedData[i * 2];
            const backImage = normalizedData[i * 2 + 1];

            leaf.innerHTML = `
                <div class="page front" style="${frontImage ? `background-image: url('${frontImage}')` : ''}"></div>
                <div class="page back" style="${backImage ? `background-image: url('${backImage}')` : ''}"></div>
            `;
            
            leaf.addEventListener('click', (e) => this.handleLeafClick(e, i));
            this.leaves.push(leaf);
            this.container.appendChild(leaf);
        }

        document.getElementById('pageSlider').max = totalLeaves;
        document.getElementById('pageTotal').innerText = `/ ${normalizedData.length}`;
        this.updateState();
    }

    lockInteraction(duration) {
        this.isAnimating = true;
        this.container.style.pointerEvents = 'none'; 
        clearTimeout(this.interactionTimeout);
        this.interactionTimeout = setTimeout(() => {
            this.isAnimating = false;
            this.container.style.pointerEvents = 'auto'; 
        }, duration);
    }

    handleLeafClick(e, index) {
        // KRITICKÝ ZÁSAH: Eliminace probublávání (Event Bubbling)
        e.stopPropagation(); 
        
        if (this.isAnimating) return;
        
        if (this.scene.dataset.state === 'closed') {
            this.openBook();
            return;
        }

        const rect = this.scene.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const isRightSide = clickX > rect.width / 2;

        if (isRightSide) this.flipNext();
        else this.flipPrev();
    }

    openBook() {
        if (this.scene.dataset.state !== 'closed') return;
        
        document.body.classList.add('reading-mode');
        this.scene.dataset.state = 'open';
        this.calculateScale();

        setTimeout(() => {
            this.flipNext(); 
        }, 400);
    }

    closeBook() {
        document.body.classList.remove('reading-mode');
        this.scene.dataset.state = 'closed';
        this.currentLeafIndex = 0;
        
        this.leaves.forEach((leaf, i) => {
            leaf.classList.remove('flipped');
            leaf.style.zIndex = this.leaves.length - i; 
        });
        
        this.calculateScale();
        this.updateState();
    }

    flipNext(fast = false) {
        if (this.currentLeafIndex < this.leaves.length) {
            const durationMs = fast ? 150 : 800;
            if (!fast) this.lockInteraction(durationMs);

            const leaf = this.leaves[this.currentLeafIndex];
            leaf.style.transitionDuration = `${durationMs}ms`;
            leaf.style.zIndex = this.leaves.length + this.currentLeafIndex;
            leaf.classList.add('flipped');
            
            this.currentLeafIndex++;
            this.updateState();
        }
    }

    flipPrev(fast = false) {
        // Logika návratu na úvodní obrazovku
        if (this.currentLeafIndex === 1 && !fast) {
            const durationMs = 800;
            this.lockInteraction(durationMs);
            this.currentLeafIndex = 0;
            
            const leaf = this.leaves[0];
            leaf.style.transitionDuration = `${durationMs}ms`;
            leaf.classList.remove('flipped');
            
            document.body.classList.remove('reading-mode');
            this.scene.dataset.state = 'closed';
            this.updateState();
            return;
        }

        // Běžné listování zpět
        if (this.currentLeafIndex > 0) {
            const durationMs = fast ? 150 : 800;
            if (!fast) this.lockInteraction(durationMs);

            this.currentLeafIndex--;
            const leaf = this.leaves[this.currentLeafIndex];
            
            leaf.style.transitionDuration = `${durationMs}ms`;
            leaf.classList.remove('flipped');
            
            const delay = fast ? 75 : 400;
            setTimeout(() => {
                leaf.style.zIndex = this.leaves.length - this.currentLeafIndex;
            }, delay);
            
            this.updateState();
        }
    }

    async goToLeaf(targetIndex) {
        if (this.isAnimating || targetIndex === this.currentLeafIndex) return;
        this.isAnimating = true;
        this.container.style.pointerEvents = 'none';

        const interval = 120; 

        if (targetIndex > this.currentLeafIndex) {
            while (this.currentLeafIndex < targetIndex) {
                this.flipNext(true);
                await new Promise(r => setTimeout(r, interval));
            }
        } else {
            while (this.currentLeafIndex > targetIndex) {
                if (this.currentLeafIndex === 1 && targetIndex === 0) this.flipPrev(false); 
                else this.flipPrev(true);
                await new Promise(r => setTimeout(r, interval));
            }
        }
        
        this.leaves.forEach(leaf => leaf.style.transitionDuration = '0.8s');
        this.container.style.pointerEvents = 'auto';
        this.isAnimating = false;

        if (targetIndex === 0) {
            this.closeBook();
        }
    }

    jumpToPage(pageNumber) {
        if (isNaN(pageNumber) || pageNumber < 1) pageNumber = 1;
        if (pageNumber > this.data.length) pageNumber = this.data.length;
        let targetLeafIndex = 0;
        if (pageNumber > 1) targetLeafIndex = Math.floor(pageNumber / 2);
        this.goToLeaf(targetLeafIndex);
    }

    updateState() {
        const slider = document.getElementById('pageSlider');
        const pageInput = document.getElementById('pageInput');
        const sliderGroup = document.getElementById('sliderGroup');
        const rewindGroup = document.getElementById('rewindGroup');
        
        slider.value = this.currentLeafIndex;
        pageInput.value = this.currentLeafIndex === 0 ? 1 : this.currentLeafIndex * 2;

        if (this.currentLeafIndex === this.leaves.length) {
            this.scene.dataset.state = 'ended';
            sliderGroup.classList.add('hidden');
            rewindGroup.classList.add('active');
        } else {
            this.scene.dataset.state = this.currentLeafIndex === 0 ? 'closed' : 'open';
            sliderGroup.classList.remove('hidden');
            rewindGroup.classList.remove('active');
        }
    }

    bindEvents() {
        document.getElementById('openMagBtn').addEventListener('click', () => this.openBook());
        
        this.scene.addEventListener('click', (e) => {
            // Ochrana před náhodným otevřením během asynchronních animací
            if (this.scene.dataset.state === 'closed' && !this.isAnimating) this.openBook();
        });

        document.getElementById('closeMagBtn').addEventListener('click', () => {
            this.goToLeaf(0);
        });
        
        document.getElementById('nextBtn').addEventListener('click', () => this.flipNext());
        document.getElementById('prevBtn').addEventListener('click', () => this.flipPrev());
        
        document.getElementById('rewindBtn').addEventListener('click', () => {
            this.goToLeaf(0);
        });
        
        const slider = document.getElementById('pageSlider');
        slider.addEventListener('change', (e) => this.goToLeaf(parseInt(e.target.value)));
        
        const pageInput = document.getElementById('pageInput');
        pageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { pageInput.blur(); this.jumpToPage(parseInt(pageInput.value)); }
        });
        pageInput.addEventListener('change', (e) => this.jumpToPage(parseInt(e.target.value)));
        
        window.addEventListener('resize', () => {
            clearTimeout(this.resizeTimer);
            this.resizeTimer = setTimeout(() => this.calculateScale(), 100);
        });
        
        document.addEventListener('keydown', (e) => {
            if (document.activeElement === pageInput || this.isAnimating) return;
            if (e.key === 'ArrowRight') this.flipNext();
            if (e.key === 'ArrowLeft') this.flipPrev();
            if (e.key === 'Escape') this.goToLeaf(0);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => new MagazineController('bookContainer', pagesData));