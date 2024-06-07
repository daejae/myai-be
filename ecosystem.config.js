module.exports = {
  apps: [
    {
      name: "app", // 애플리케이션 이름
      script: "dist/main.js", // 실행할 스크립트
      instances: 1, // 인스턴스 수 (0이면 모든 CPU 코어 사용)
      exec_mode: "fork", // 실행 모드: 'fork' 또는 'cluster'
      watch: false, // 파일 변경 시 자동 재시작
      max_memory_restart: "1G", // 메모리 사용량이 지정된 값을 초과하면 재시작
      autorestart: true,
    },
  ],
};
