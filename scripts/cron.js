setInterval(async () => {
  await fetch("http://localhost:3000/api/email/run-scheduler");
  console.log("Cron ran");
}, 60000);