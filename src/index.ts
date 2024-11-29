import main from "./main";

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});

console.log("This shouldn't be here");
