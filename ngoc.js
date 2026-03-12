
        // --- NỀN HẠT 3D XUNG QUANH ---
        let scene, camera, renderer, particles;
        function initBackground() {
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.z = 250; 
            renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('scene'), alpha: true, antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);

            const positions = new Float32Array(2000 * 3); 
            for (let i = 0; i < 2000; i++) {
                let radius = 150, theta = THREE.MathUtils.randFloatSpread(360), phi = THREE.MathUtils.randFloatSpread(360);
                positions[i*3] = radius * Math.sin(phi) * Math.cos(theta); 
                positions[i*3+1] = radius * Math.sin(phi) * Math.sin(theta); 
                positions[i*3+2] = radius * Math.cos(phi); 
            }
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            
            const canvas = document.createElement('canvas'); canvas.width = 16; canvas.height = 16;
            const ctx = canvas.getContext('2d');
            const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)'); gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = gradient; ctx.fillRect(0, 0, 16, 16);

            const material = new THREE.PointsMaterial({ size: 2, map: new THREE.CanvasTexture(canvas), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
            particles = new THREE.Points(geometry, material);
            scene.add(particles);

            window.addEventListener('resize', () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            });
        }
        function animateBackground() {
            requestAnimationFrame(animateBackground);
            particles.rotation.y += 0.001; 
            renderer.render(scene, camera);
        }
        initBackground();
        animateBackground();


        // --- GSAP ANIMATION MỞ MÀN ---
        const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
        tl.to('.card-container', { duration: 1.5, opacity: 1, y: 0, delay: 0.5 }) 
          .fromTo('#title', { opacity: 0 }, { duration: 1, opacity: 1 }, "-=0.5")
          .fromTo('#name', { opacity: 0 }, { duration: 1.5, opacity: 1 }, "-=0.5")
          .to('#openBtn', { duration: 1, opacity: 1 }, "-=0.5");


        // --- HÀM TẠO HIỆU ỨNG TRÔI NỔI VÔ TẬN ---
        function floatAround(element) {
            const isMobile = window.innerWidth <= 600;
            const imgSize = isMobile ? 100 : 150;
            
            // Tính toán một tọa độ ngẫu nhiên mới trên toàn bộ màn hình
            const nextX = Math.max(10, Math.random() * (window.innerWidth - imgSize - 10));
            const nextY = Math.max(10, Math.random() * (window.innerHeight - imgSize - 10));
            
            // Bay đến vị trí mới với tốc độ cực chậm (từ 8 đến 15 giây) để tạo sự êm ái
            gsap.to(element, {
                x: nextX,
                y: nextY,
                rotation: "+=" + (Math.random() * 40 - 20), // Vừa trôi vừa xoay nhẹ
                duration: 8 + Math.random() * 7, 
                ease: "sine.inOut", // Gia tốc mượt ở điểm đầu và cuối
                onComplete: () => floatAround(element) // Khi đến nơi, gọi lại chính hàm này để đi tiếp
            });
        }


        // --- XỬ LÝ NÚT BẤM, PHÁT NHẠC VÀ TRẢI ĐỀU ẢNH ---
        const btn = document.getElementById('openBtn');
        const message = document.getElementById('message');
        const photos = document.querySelectorAll('.photo-item');
        const cardContainer = document.getElementById('card');
        const ytAudio = document.getElementById('youtube-audio');

        btn.addEventListener('click', function() {
            // 1. Phát nhạc
            ytAudio.src = "https://www.youtube.com/embed/moAcRqPXU-4?autoplay=1&loop=1&playlist=moAcRqPXU-4";

            // 2. Ẩn nút và hiện lời chúc
            gsap.to(this, { duration: 0.5, opacity: 0, display: 'none' });
            gsap.fromTo(message, { opacity: 0, display: "none" }, { duration: 1.5, opacity: 1, display: "block", delay: 0.2 });

            // 3. Làm mờ thiệp để thấy ảnh rõ hơn
            cardContainer.style.background = 'rgba(255, 255, 255, 0.1)';
            cardContainer.style.backdropFilter = 'blur(5px)';
            cardContainer.style.webkitBackdropFilter = 'blur(5px)';

            // 4. Tính toán các điểm trải đều ảnh quanh viền màn hình (Lúc mới xuất hiện)
            const isMobile = window.innerWidth <= 600;
            const imgSize = isMobile ? 100 : 150;
            const centerX = window.innerWidth / 2 - imgSize / 2;
            const centerY = window.innerHeight / 2 - imgSize / 2;

            const targetPositions = [
                { x: window.innerWidth * 0.1 - imgSize/2, y: window.innerHeight * 0.15 - imgSize/2 }, 
                { x: window.innerWidth * 0.9 - imgSize/2, y: window.innerHeight * 0.2 - imgSize/2 },  
                { x: window.innerWidth * 0.15 - imgSize/2, y: window.innerHeight * 0.8 - imgSize/2 }, 
                { x: window.innerWidth * 0.85 - imgSize/2, y: window.innerHeight * 0.85 - imgSize/2 },
                { x: window.innerWidth * 0.5 - imgSize/2, y: window.innerHeight * 0.1 - imgSize/2 },  
                { x: window.innerWidth * 0.5 - imgSize/2, y: window.innerHeight * 0.9 - imgSize/2 },  
            ];

            // 5. Animation bung ảnh từ giữa ra
            photos.forEach((photo, index) => {
                let destX, destY;
                if(index < targetPositions.length) {
                    destX = targetPositions[index].x;
                    destY = targetPositions[index].y;
                } else {
                    destX = Math.random() * (window.innerWidth - imgSize);
                    destY = Math.random() * (window.innerHeight - imgSize);
                }

                destX = Math.max(10, Math.min(destX, window.innerWidth - imgSize - 10));
                destY = Math.max(10, Math.min(destY, window.innerHeight - imgSize - 10));

                // Tất cả ảnh bắt đầu từ tâm màn hình
                gsap.set(photo, { x: centerX, y: centerY, scale: 0, rotation: Math.random() * 360 });

                // Bay ra vị trí đích
                gsap.to(photo, {
                    duration: 2, // Thời gian bung ra (2 giây)
                    x: destX,
                    y: destY,
                    opacity: 0.85,
                    scale: 1,
                    rotation: Math.random() * 30 - 15, 
                    delay: 0.1 + (index * 0.15),
                    ease: "power3.out", // Bung ra dứt khoát rồi chậm dần
                    onComplete: () => {
                        // NGAY SAU KHI ĐẾN NƠI -> BẮT ĐẦU TRÔI NỔI KHẮP MÀN HÌNH
                        floatAround(photo);
                    }
                });
            });
        });