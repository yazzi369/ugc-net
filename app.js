// Study Planner Application JavaScript
class StudyPlannerApp {
    constructor() {
        this.examDate = new Date('2025-12-15');
        this.currentSection = 'phases';
        this.timerState = {
            isRunning: false,
            timeLeft: 2 * 60 * 60, // 2 hours in seconds
            sessionType: 'weekday'
        };
        this.studyStreak = 7;
        this.mockTests = [
            { date: '2025-07-15', paper1: 65, paper2: 72 },
            { date: '2025-07-08', paper1: 58, paper2: 64 }
        ];
        this.weekProgress = {
            1: { completed: 3, total: 7 },
            2: { completed: 1, total: 7 }
        };
        this.unitProgress = {
            1: { progress: 45, confidence: 'moderate' },
            2: { progress: 60, confidence: 'strong' },
            3: { progress: 20, confidence: 'weak' },
            7: { progress: 35, confidence: 'moderate' }
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateCountdown();
        this.setupTimer();
        this.updateProgressDisplays();
        
        // Update countdown every minute
        setInterval(() => this.updateCountdown(), 60000);
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchSection(e.target.dataset.section));
        });

        // Timer controls
        document.getElementById('startTimer')?.addEventListener('click', () => this.startTimer());
        document.getElementById('pauseTimer')?.addEventListener('click', () => this.pauseTimer());
        document.getElementById('resetTimer')?.addEventListener('click', () => this.resetTimer());
        document.getElementById('sessionType')?.addEventListener('change', (e) => this.changeSessionType(e.target.value));

        // Day checkboxes
        document.querySelectorAll('.day-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => this.updateDayProgress(e.target));
        });

        // Generate more weeks button
        document.querySelector('.more-weeks button')?.addEventListener('click', () => this.generateMoreWeeks());

        // Mock test form
        document.querySelector('.add-mock button')?.addEventListener('click', () => this.addMockResult());

        // Weekly reflection save
        document.querySelector('.weekly-reflection button')?.addEventListener('click', () => this.saveReflection());
    }

    switchSection(sectionId) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');

        // Update sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');

        this.currentSection = sectionId;
    }

    updateCountdown() {
        const now = new Date();
        const timeDiff = this.examDate - now;
        const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        
        document.getElementById('daysUntilExam').textContent = daysLeft;
    }

    startTimer() {
        if (!this.timerState.isRunning) {
            this.timerState.isRunning = true;
            this.timerInterval = setInterval(() => this.updateTimer(), 1000);
            
            document.getElementById('startTimer').textContent = 'Running...';
            document.getElementById('startTimer').disabled = true;
        }
    }

    pauseTimer() {
        if (this.timerState.isRunning) {
            this.timerState.isRunning = false;
            clearInterval(this.timerInterval);
            
            document.getElementById('startTimer').textContent = 'Resume';
            document.getElementById('startTimer').disabled = false;
        }
    }

    resetTimer() {
        this.timerState.isRunning = false;
        clearInterval(this.timerInterval);
        
        const sessionType = document.getElementById('sessionType').value;
        this.timerState.timeLeft = sessionType === 'weekday' ? 2 * 60 * 60 : 4 * 60 * 60;
        
        this.updateTimerDisplay();
        document.getElementById('startTimer').textContent = 'Start Session';
        document.getElementById('startTimer').disabled = false;
    }

    updateTimer() {
        if (this.timerState.timeLeft > 0) {
            this.timerState.timeLeft--;
            this.updateTimerDisplay();
        } else {
            // Timer completed
            this.pauseTimer();
            this.showSuccessMessage('🎉 Study session completed! Great job!');
            this.updateStreak();
        }
    }

    updateTimerDisplay() {
        const hours = Math.floor(this.timerState.timeLeft / 3600);
        const minutes = Math.floor((this.timerState.timeLeft % 3600) / 60);
        const seconds = this.timerState.timeLeft % 60;
        
        const display = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('timerDisplay').textContent = display;
    }

    changeSessionType(type) {
        this.timerState.sessionType = type;
        if (!this.timerState.isRunning) {
            this.timerState.timeLeft = type === 'weekday' ? 2 * 60 * 60 : 4 * 60 * 60;
            this.updateTimerDisplay();
        }
    }

    setupTimer() {
        this.updateTimerDisplay();
    }

    updateDayProgress(checkbox) {
        const weekMatch = checkbox.id.match(/w(\d+)d(\d+)/);
        if (weekMatch) {
            const weekNum = parseInt(weekMatch[1]);
            const dayNum = parseInt(weekMatch[2]);
            
            if (!this.weekProgress[weekNum]) {
                this.weekProgress[weekNum] = { completed: 0, total: 7 };
            }
            
            if (checkbox.checked) {
                this.weekProgress[weekNum].completed++;
            } else {
                this.weekProgress[weekNum].completed = Math.max(0, this.weekProgress[weekNum].completed - 1);
            }
            
            this.updateWeekProgressDisplay(weekNum);
            this.updateOverallProgress();
        }
    }

    updateWeekProgressDisplay(weekNum) {
        const progress = this.weekProgress[weekNum];
        const progressSpan = document.querySelector(`#week${weekNum}`).parentElement.querySelector('.week-progress');
        if (progressSpan) {
            progressSpan.textContent = `${progress.completed}/${progress.total} days`;
        }
    }

    updateOverallProgress() {
        // Calculate overall progress based on completed tasks
        let totalCompleted = 0;
        let totalTasks = 0;
        
        Object.values(this.weekProgress).forEach(week => {
            totalCompleted += week.completed;
            totalTasks += week.total;
        });
        
        const percentage = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 12;
        document.querySelector('.progress-percentage').textContent = `${percentage}%`;
        
        // Update progress circle
        const progressCircle = document.querySelector('.progress-circle');
        progressCircle.style.background = `conic-gradient(var(--color-white) ${percentage}%, rgba(255, 255, 255, 0.2) ${percentage}%)`;
    }

    updateProgressDisplays() {
        this.updateOverallProgress();
        
        // Update week progress displays
        Object.keys(this.weekProgress).forEach(weekNum => {
            this.updateWeekProgressDisplay(parseInt(weekNum));
        });
    }

    updateStreak() {
        this.studyStreak++;
        document.querySelector('.streak-number').textContent = this.studyStreak;
        
        // Update streak visual
        const streakVisual = document.querySelector('.streak-visual');
        streakVisual.textContent = '🔥'.repeat(Math.min(this.studyStreak, 10));
    }

    addMockResult() {
        const dateInput = document.getElementById('mockDate');
        const paper1Input = document.getElementById('paper1Score');
        const paper2Input = document.getElementById('paper2Score');
        
        const date = dateInput.value;
        const paper1 = parseInt(paper1Input.value);
        const paper2 = parseInt(paper2Input.value);
        
        if (date && paper1 && paper2) {
            const newMock = { date, paper1, paper2 };
            this.mockTests.unshift(newMock);
            
            this.updateMockDisplay();
            this.updateMockStats();
            
            // Clear form
            dateInput.value = '';
            paper1Input.value = '';
            paper2Input.value = '';
            
            this.showSuccessMessage('Mock test result added successfully!');
        }
    }

    updateMockDisplay() {
        const mockList = document.getElementById('mockList');
        mockList.innerHTML = '';
        
        this.mockTests.slice(0, 5).forEach(mock => {
            const mockItem = document.createElement('div');
            mockItem.className = 'mock-item';
            
            const total = ((mock.paper1 + mock.paper2) / 2).toFixed(1);
            
            mockItem.innerHTML = `
                <span class="mock-date">${mock.date}</span>
                <span class="mock-scores">Paper 1: ${mock.paper1}% | Paper 2: ${mock.paper2}%</span>
                <span class="mock-total">Total: ${total}%</span>
            `;
            
            mockList.appendChild(mockItem);
        });
    }

    updateMockStats() {
        if (this.mockTests.length === 0) return;
        
        // Calculate average
        const totalAvg = this.mockTests.reduce((sum, mock) => {
            return sum + (mock.paper1 + mock.paper2) / 2;
        }, 0) / this.mockTests.length;
        
        // Calculate improvement (comparing first and last test)
        let improvement = 0;
        if (this.mockTests.length >= 2) {
            const latest = (this.mockTests[0].paper1 + this.mockTests[0].paper2) / 2;
            const oldest = (this.mockTests[this.mockTests.length - 1].paper1 + this.mockTests[this.mockTests.length - 1].paper2) / 2;
            improvement = latest - oldest;
        }
        
        // Update display
        const statBoxes = document.querySelectorAll('.stat-box .stat-number');
        statBoxes[0].textContent = this.mockTests.length;
        statBoxes[1].textContent = `${Math.round(totalAvg)}%`;
        statBoxes[2].textContent = `${improvement >= 0 ? '+' : ''}${Math.round(improvement)}%`;
    }

    saveReflection() {
        const textarea = document.querySelector('.weekly-reflection textarea');
        const reflection = textarea.value.trim();
        
        if (reflection) {
            this.showSuccessMessage('Weekly reflection saved! 📝');
            // In a real app, this would be saved to a backend
            textarea.value = '';
        }
    }

    generateMoreWeeks() {
        // Simulate generating more weeks
        const moreWeeksDiv = document.querySelector('.more-weeks');
        moreWeeksDiv.innerHTML = `
            <div style="padding: var(--space-16); text-align: center;">
                <p>✨ Generating personalized weeks 3-20...</p>
                <div style="width: 100%; height: 4px; background: var(--color-secondary); border-radius: var(--radius-full); margin: var(--space-16) 0;">
                    <div class="loading-bar" style="height: 100%; background: var(--color-primary); border-radius: var(--radius-full); width: 0%; transition: width 2s ease;"></div>
                </div>
            </div>
        `;
        
        // Animate loading bar
        setTimeout(() => {
            const loadingBar = document.querySelector('.loading-bar');
            if (loadingBar) {
                loadingBar.style.width = '100%';
            }
        }, 100);
        
        setTimeout(() => {
            moreWeeksDiv.innerHTML = `
                <div style="padding: var(--space-16); text-align: center; color: var(--color-success);">
                    <p>✅ Weeks 3-20 have been generated based on your progress!</p>
                    <p><small>They will appear as you complete current weeks to maintain focus.</small></p>
                </div>
            `;
        }, 2500);
    }

    showSuccessMessage(message) {
        // Create and show a temporary success message
        const messageDiv = document.createElement('div');
        messageDiv.className = 'success-message';
        messageDiv.textContent = message;
        messageDiv.style.position = 'fixed';
        messageDiv.style.top = '20px';
        messageDiv.style.right = '20px';
        messageDiv.style.zIndex = '1000';
        messageDiv.style.maxWidth = '300px';
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }

    showErrorMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'error-message';
        messageDiv.textContent = message;
        messageDiv.style.position = 'fixed';
        messageDiv.style.top = '20px';
        messageDiv.style.right = '20px';
        messageDiv.style.zIndex = '1000';
        messageDiv.style.maxWidth = '300px';
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }
}

// Week expansion functionality
function toggleWeek(weekNum) {
    const content = document.getElementById(`week${weekNum}`);
    const header = content.previousElementSibling;
    
    if (content.classList.contains('expanded')) {
        content.classList.remove('expanded');
        header.classList.remove('expanded');
    } else {
        content.classList.add('expanded');
        header.classList.add('expanded');
    }
}

// Motivation panel interactions
function setupMotivationInteractions() {
    // Add click interactions to motivation items
    document.querySelectorAll('.motivation-card li').forEach(item => {
        item.addEventListener('click', function() {
            this.style.opacity = '0.6';
            this.style.textDecoration = 'line-through';
            
            setTimeout(() => {
                this.style.opacity = '1';
                this.style.textDecoration = 'none';
            }, 2000);
        });
    });
}

// Unit progress interactions
function updateUnitConfidence(unitId, confidence) {
    // This would update the confidence level for a unit
    const unitCard = document.querySelector(`[data-unit-id="${unitId}"]`);
    if (unitCard) {
        const confidenceSpan = unitCard.querySelector('.confidence');
        const confidenceMap = {
            'strong': '💪 Strong',
            'moderate': '🤔 Moderate', 
            'weak': '😰 Weak'
        };
        confidenceSpan.textContent = confidenceMap[confidence];
        confidenceSpan.className = `confidence ${confidence}`;
    }
}

// Emergency motivation quick actions
function handleEmergencyTask(taskElement) {
    taskElement.classList.add('completed');
    setTimeout(() => {
        taskElement.classList.remove('completed');
    }, 3000);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const app = new StudyPlannerApp();
    setupMotivationInteractions();
    
    // Add some sample data for demo
    app.updateMockDisplay();
    app.updateMockStats();
    
    // Add click handlers for emergency motivation tasks
    document.querySelectorAll('.feeling-low li, .confidence-booster li, .fallback-activities li').forEach(item => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', function() {
            this.style.backgroundColor = 'var(--color-bg-3)';
            this.style.transform = 'scale(0.98)';
            this.style.transition = 'all 0.2s ease';
            
            setTimeout(() => {
                this.style.backgroundColor = '';
                this.style.transform = '';
            }, 300);
        });
    });
    
    // Add hover effects for interactive elements
    document.querySelectorAll('.phase-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = 'var(--shadow-md)';
            this.style.transition = 'all 0.2s ease';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });
    });
    
    // Add progress bar animations
    document.querySelectorAll('.progress-fill').forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0%';
        setTimeout(() => {
            bar.style.width = width;
        }, 500);
    });
    
    console.log('✨ UGC NET JRF Home Science Study Planner loaded successfully!');
});