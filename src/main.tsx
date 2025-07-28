import { connect } from "datocms-plugin-sdk";
import "datocms-react-ui/styles.css";
import { render } from "./utils/render";
import MultiModelRecordViewer from "./components/MultiModelRecordViewer.tsx";

connect({
  // Define a custom page: https://www.datocms.com/docs/plugin-sdk/custom-pages
  mainNavigationTabs() {
    return [
      {
        label: "Multi-Model Records Viewer",
        icon: "table", // Any of these: https://fontawesome.com/v5/search?o=r&s=solid
        pointsTo: {
          pageId: "mmrv", // ID we define
        },
        placement: ["after", "content"], // Make it the second tab
      },
    ];
  },

  // Render it
  renderPage(_pageId, ctx) {
    render(<MultiModelRecordViewer ctx={ctx} />);
  },
});
