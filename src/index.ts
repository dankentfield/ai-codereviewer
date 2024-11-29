import main from "./main";

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
