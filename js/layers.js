addLayer("a", {
  name: "achievements", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "A", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: true,
    };
  },
  color: "gold",

  type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have

  row: "side", // Row the layer is in on the tree (0 is the first row)

  layerShown() {
    return true;
  },
  tooltip: "achievements",
  tabFormat: {
    Achievements: {
      content: [
        "main-display",
        ["blank", "5px"], // Height
        ["bar", "progress"],
        "achievements",
      ],
    },
    Saves: {
      content: [
        "main-display",
        ["blank", "5px"], // Height

        "clickables",
      ],
    },
  },
  clickables: {
    11: {
      title: "Prestige",
      display: "Layer Start",
      canClick: true,
      onClick() {
        if (!confirm("Your current progress will not be saved!")) return;
        importSave(
          "eyJ0YWIiOiJvcHRpb25zLXRhYiIsIm5hdlRhYiI6InRyZWUtdGFiIiwidGltZSI6MTc4NTI1MTk2OTU5Niwibm90aWZ5Ijp7fSwidmVyc2lvblR5cGUiOiJ0aGVsb29wdHJlZTIiLCJ2ZXJzaW9uIjoiMS4wIiwidGltZVBsYXllZCI6MjMuMjU2MDAwMDAwMDAwMDcsImtlZXBHb2luZyI6ZmFsc2UsImhhc05hTiI6dHJ1ZSwicG9pbnRzIjoiMS45OTYwMDAwMDAwMDAwMDAyIiwic3VidGFicyI6eyJjaGFuZ2Vsb2ctdGFiIjp7fSwiYSI6eyJtYWluVGFicyI6IkFjaGlldmVtZW50cyJ9LCJsIjp7Im1haW5UYWJzIjoiTG9vcHMifSwicCI6eyJtYWluVGFicyI6Ik1haW4ifSwicyI6eyJtYWluVGFicyI6Ik1haW4ifSwicHQiOnsibWFpblRhYnMiOiJQcm90b25zIn19LCJsYXN0U2FmZVRhYiI6InAiLCJpbmZvYm94ZXMiOnsicHQiOnsicHRpbmZvIjpmYWxzZX19LCJpbmZvLXRhYiI6eyJ1bmxvY2tlZCI6dHJ1ZSwidG90YWwiOiIwIiwiYmVzdCI6IjAiLCJyZXNldFRpbWUiOjIzLjI1NjAwMDAwMDAwMDA3LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sIm9wdGlvbnMtdGFiIjp7InVubG9ja2VkIjp0cnVlLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6MjMuMjU2MDAwMDAwMDAwMDcsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwiY2hhbmdlbG9nLXRhYiI6eyJ1bmxvY2tlZCI6dHJ1ZSwidG90YWwiOiIwIiwiYmVzdCI6IjAiLCJyZXNldFRpbWUiOjIzLjI1NjAwMDAwMDAwMDA3LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sImJsYW5rIjp7InVubG9ja2VkIjp0cnVlLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6MjMuMjU2MDAwMDAwMDAwMDcsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIifSwidHJlZS10YWIiOnsidW5sb2NrZWQiOnRydWUsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjoyMy4yNTYwMDAwMDAwMDAwNywiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJhIjp7InVubG9ja2VkIjp0cnVlLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6MjMuMjU2MDAwMDAwMDAwMDcsImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6eyIxMSI6IiJ9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbIjExIl0sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJsIjp7InVubG9ja2VkIjp0cnVlLCJwb2ludHMiOiIxIiwidG90YWwiOiIxIiwiYmVzdCI6IjEiLCJyZXNldFRpbWUiOjEyLjg5NzAwMDAwMDAwMDAyNywiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6WyIxIl0sImxhc3RNaWxlc3RvbmUiOiIxIiwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sInAiOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjEiLCJ0b3RhbCI6IjEiLCJiZXN0IjoiMSIsInJlc2V0VGltZSI6MS45OTYwMDAwMDAwMDAwMDAyLCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIiwiYWN0aXZlQ2hhbGxlbmdlIjpudWxsfSwicyI6eyJ1bmxvY2tlZCI6ZmFsc2UsInBvaW50cyI6IjAiLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6MTIuODk3MDAwMDAwMDAwMDI3LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIiwiYWN0aXZlQ2hhbGxlbmdlIjpudWxsfSwicHQiOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjAiLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6MTIuODk3MDAwMDAwMDAwMDI3LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIiwiYWN0aXZlQ2hhbGxlbmdlIjpudWxsfX0="
        );
      },
      style() {
        return {
          "background-color": tmp.p.color,
        };
      },
    },
    12: {
      title: "Super",
      display: "Layer Start",
      canClick: true,
      onClick() {
        if (!confirm("Your current progress will not be saved!")) return;
        importSave(
          "eyJ0YWIiOiJvcHRpb25zLXRhYiIsIm5hdlRhYiI6InRyZWUtdGFiIiwidGltZSI6MTc4NTI1MjA5NTUxMiwibm90aWZ5Ijp7fSwidmVyc2lvblR5cGUiOiJ0aGVsb29wdHJlZTIiLCJ2ZXJzaW9uIjoiMS4wIiwidGltZVBsYXllZCI6MTMxLjA0MSwia2VlcEdvaW5nIjpmYWxzZSwiaGFzTmFOIjp0cnVlLCJwb2ludHMiOiI1LjY5Mzk5OTk5OTk5OTk5OCIsInN1YnRhYnMiOnsiY2hhbmdlbG9nLXRhYiI6e30sImEiOnsibWFpblRhYnMiOiJBY2hpZXZlbWVudHMifSwibCI6eyJtYWluVGFicyI6Ikxvb3BzIn0sInAiOnsibWFpblRhYnMiOiJNYWluIn0sInMiOnsibWFpblRhYnMiOiJNYWluIn0sInB0Ijp7Im1haW5UYWJzIjoiUHJvdG9ucyJ9fSwibGFzdFNhZmVUYWIiOiJzIiwiaW5mb2JveGVzIjp7InB0Ijp7InB0aW5mbyI6ZmFsc2V9fSwiaW5mby10YWIiOnsidW5sb2NrZWQiOnRydWUsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjoxMzEuMDQxLCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sIm9wdGlvbnMtdGFiIjp7InVubG9ja2VkIjp0cnVlLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6MTMxLjA0MSwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJjaGFuZ2Vsb2ctdGFiIjp7InVubG9ja2VkIjp0cnVlLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6MTMxLjA0MSwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9LCJhIjp7InVubG9ja2VkIjp0cnVlLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6MTMxLjA0MSwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7IjExIjoiIiwiMTIiOiIifSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6WyIxMSIsIjEyIiwiMTQiLCIxMyIsIjE1IiwiMjEiXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sImwiOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjIiLCJ0b3RhbCI6IjEiLCJiZXN0IjoiMSIsInJlc2V0VGltZSI6MTIwLjY4MTk5OTk5OTk5OTQ5LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbIjEiLCIyIl0sImxhc3RNaWxlc3RvbmUiOiIyIiwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sInAiOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjAiLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6Mi44NDY5OTk5OTk5OTk5OTksImZvcmNlVG9vbHRpcCI6ZmFsc2UsImJ1eWFibGVzIjp7fSwibm9SZXNwZWNDb25maXJtIjpmYWxzZSwiY2xpY2thYmxlcyI6e30sInNwZW50T25CdXlhYmxlcyI6IjAiLCJ1cGdyYWRlcyI6W10sIm1pbGVzdG9uZXMiOltdLCJsYXN0TWlsZXN0b25lIjpudWxsLCJhY2hpZXZlbWVudHMiOltdLCJjaGFsbGVuZ2VzIjp7fSwiZ3JpZCI6e30sInByZXZUYWIiOiIiLCJhY3RpdmVDaGFsbGVuZ2UiOm51bGx9LCJzIjp7InVubG9ja2VkIjp0cnVlLCJwb2ludHMiOiIxIiwidG90YWwiOiIxIiwiYmVzdCI6IjEiLCJyZXNldFRpbWUiOjIuODQ2OTk5OTk5OTk5OTk5LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIiwiYWN0aXZlQ2hhbGxlbmdlIjpudWxsfSwicHQiOnsidW5sb2NrZWQiOnRydWUsInBvaW50cyI6IjAiLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6MTIwLjY4MTk5OTk5OTk5OTQ5LCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIiwiYWN0aXZlQ2hhbGxlbmdlIjpudWxsfSwiYmxhbmsiOnsidW5sb2NrZWQiOnRydWUsInRvdGFsIjoiMCIsImJlc3QiOiIwIiwicmVzZXRUaW1lIjoxMzEuMDQxLCJmb3JjZVRvb2x0aXAiOmZhbHNlLCJidXlhYmxlcyI6e30sIm5vUmVzcGVjQ29uZmlybSI6ZmFsc2UsImNsaWNrYWJsZXMiOnt9LCJzcGVudE9uQnV5YWJsZXMiOiIwIiwidXBncmFkZXMiOltdLCJtaWxlc3RvbmVzIjpbXSwibGFzdE1pbGVzdG9uZSI6bnVsbCwiYWNoaWV2ZW1lbnRzIjpbXSwiY2hhbGxlbmdlcyI6e30sImdyaWQiOnt9LCJwcmV2VGFiIjoiIn0sInRyZWUtdGFiIjp7InVubG9ja2VkIjp0cnVlLCJ0b3RhbCI6IjAiLCJiZXN0IjoiMCIsInJlc2V0VGltZSI6MTMxLjA0MSwiZm9yY2VUb29sdGlwIjpmYWxzZSwiYnV5YWJsZXMiOnt9LCJub1Jlc3BlY0NvbmZpcm0iOmZhbHNlLCJjbGlja2FibGVzIjp7fSwic3BlbnRPbkJ1eWFibGVzIjoiMCIsInVwZ3JhZGVzIjpbXSwibWlsZXN0b25lcyI6W10sImxhc3RNaWxlc3RvbmUiOm51bGwsImFjaGlldmVtZW50cyI6W10sImNoYWxsZW5nZXMiOnt9LCJncmlkIjp7fSwicHJldlRhYiI6IiJ9fQ=="
        );
      },
      style() {
        return {
          "background-color": tmp.s.color,
        };
      },
    },
    13: {
      title: "Proton",
      display: "Layer Start",
      canClick: true,
      onClick() {
        if (!confirm("Your current progress will not be saved!")) return;
        importSave(
          "eyJ0YWIiOiJvcHRpb25zLXRhYiIsIm5hdlRhYiI6InRyZWUtdGFiIiwidGltZSI6MTc4NTI1MjIzOTg3Mywibm90aWZ5Ijp7fSwidmVyc2lvblR5cGUiOiJ0aGVsb29wdHJlZTIiLCJ2ZXJzaW9uIjoiMS4wIiwidGltZVBsYXllZCI6MjU5LjAzNTAwMDAwMDAxMjIsImtlZXBHb2luZyI6ZmFsc2UsImhhc05hTiI6dHJ1ZSwicG9pbn"
        );
      },
      style() {
        return {
          "background-color": tmp.pt.color,
        };
      },
    },
  },
  bars: {
    progress: {
      fillStyle: { "background-color": "blue" },
      baseStyle: { "background-color": "grey" },
      textStyle: { color: "white" },
      borderStyle() {
        return {};
      },
      direction: RIGHT,
      width: 750,
      height: 45,
      progress() {
        return new Decimal(player.a.achievements.length).div(13);
      },
      display() {
        return (
          formatWhole(player.a.achievements.length) +
          " / 13 achievements (" +
          format(new Decimal(player.a.achievements.length).div(13).times(100)) +
          "%)"
        );
      },
      unlocked: true,
    },
  },
  achievements: {
    11: {
      name: "Thanks For Playing!",
      done() {
        return hasMilestone("l", 1);
      }, // This one is a freebie
      tooltip: "Get your first loop.",
    },
    12: {
      name: "Gotta Start Somewhere",
      done() {
        return hasUpgrade("p", 11);
      }, // This one is a freebie
      tooltip: "Buy your first prestige upgrade.",
    },
    13: {
      name: "Very True",
      done() {
        return hasUpgrade("p", 13);
      }, // This one is a freebie
      tooltip: "Buy your 3rd prestige upgrade.",
    },
    14: {
      name: "All My Progress!",
      done() {
        return hasMilestone("l", 2);
      }, // This one is a freebie
      tooltip: "Get your 2nd loop.",
    },
    15: {
      name: "Almost To The Next Layer",
      done() {
        return hasUpgrade("p", 15);
      }, // This one is a freebie
      tooltip: "Buy your 5th prestige upgrade.",
    },
    21: {
      name: "Super!",
      done() {
        return player.s.points.gte(1);
      }, // This one is a freebie
      tooltip: "Do a super.",
    },
    22: {
      name: "Super Effect Is OP",
      done() {
        return player.s.points.gte(15);
      }, // This one is a freebie
      tooltip: "Get 15 super points.",
    },
    23: {
      name: "Loop, Loop, And Loop",
      done() {
        return player.l.points.gte(3);
      }, // This one is a freebie
      tooltip: "Get your 3rd loop.",
    },
    24: {
      name: "Lucky 7",
      done() {
        return player.s.points.gte(77);
      }, // This one is a freebie
      tooltip: "Get 77 super points.",
    },
    25: {
      name: "A <i>Generation</i>al Milestone",
      done() {
        return hasMilestone("s", 1);
      }, // This one is a freebie
      tooltip: "Obtain your first super milestone.",
    },
    31: {
      name: "10th Upgrade",
      done() {
        return hasUpgrade("s", 15);
      }, // This one is a freebie
      tooltip: "Buy your 5th super upgrade.",
    },
    32: {
      name: "Incremental Tree Reference?",
      done() {
        return player.pt.points.gte(1);
      }, // This one is a freebie
      tooltip: "Get 1 proton.",
    },
    33: {
      name: "V1.0 Endgame",
      done() {
        return hasUpgrade("pt", 12);
      }, // This one is a freebie
      tooltip: "Buy your 2nd proton upgrade.",
    },
  },
});
addLayer("l", {
  name: "loops", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "L", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: true,
      points: new Decimal(0),
    };
  },
  color: "grey",
  requires: new Decimal(10), // Can be a function that takes requirement increases into account
  resource: "loops", // Name of prestige currency
  baseResource: "points", // Name of resource prestige is based on
  baseAmount() {
    return player.points;
  }, // Get the current amount of baseResource
  type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  base: 50,
  exponent: 1.5, // Prestige currency exponent
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1);
    return mult;
  },
  gainExp() {
    // Calculate the exponent on main currency from bonuses
    exp = new Decimal(1);
    if (player.l.points.gte(3)) exp = exp.times(0.57);
    return exp;
  },
  row: 1000, // Row the layer is in on the tree (0 is the first row)
  hotkeys: [
    {
      key: "L",
      description: "SHIFT + L: Reset for loops",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  layerShown() {
    return true;
  },
  tabFormat: {
    Loops: {
      content: [
        [
          "display-text",
          function () {
            return "You are at loop " + formatWhole(player.l.points) + ".";
          },
          { "font-size": "26px" },
        ],
        ["blank", "10px"], // Height

        "prestige-button",
        "resource-display",

        ["blank", "15px"], // Height
        ["bar", "loopProgress"],
        ["blank", "10px"], // Height

        "milestones",
      ],
    },
  },
  bars: {
    loopProgress: {
      fillStyle: { "background-color": "blue" },
      baseStyle: { "background-color": "grey" },
      textStyle: { color: "white" },
      borderStyle() {
        return {};
      },
      direction: RIGHT,
      width: 750,
      height: 45,
      progress() {
        return player.points.log(getNextAt(this.layer));
      },
      display() {
        return (
          format(player.points) +
          " / " +
          formatWhole(getNextAt(this.layer)) +
          " points to next loop (" +
          format(player.points.log(getNextAt(this.layer)).times(100)) +
          "%)"
        );
      },
      unlocked: true,
    },
  },
  milestones: {
    1: {
      requirementDescription: "Loop 1",
      done() {
        return player.l.points.gte(1);
      }, // Used to determine when to give the milestone
      effectDescription:
        "Welcome to The Loop Tree 2. If you haven't played The Loop Tree 1, play it first. Unlock prestige.",
    },
    2: {
      requirementDescription: "Loop 2",
      done() {
        return player.l.points.gte(2);
      }, // Used to determine when to give the milestone
      effectDescription:
        "Triple prestige points. Unlock 2 new upgrades and super points.",
    },
    3: {
      requirementDescription: "Loop 3",
      done() {
        return player.l.points.gte(3);
      }, // Used to determine when to give the milestone
      effectDescription: "Quintuple points. Unlock more super content.",
    },
    4: {
      requirementDescription: "Loop 4",
      done() {
        return player.l.points.gte(4);
      }, // Used to determine when to give the milestone
      effectDescription: "5x super. Unlock protons.",
    },
  },
});
addLayer("p", {
  name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),
    };
  },
  color: "cyan",
  requires: new Decimal(10), // Can be a function that takes requirement increases into account
  resource: "prestige points", // Name of prestige currency
  baseResource: "points", // Name of resource prestige is based on
  baseAmount() {
    return player.points;
  }, // Get the current amount of baseResource
  type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  exponent: 0.5, // Prestige currency exponent
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1);
    if (hasMilestone("l", 2)) mult = mult.times(3);
    if (hasUpgrade("p", 15)) mult = mult.times(1.4);
    if (hasUpgrade("s", 12)) mult = mult.times(3);
    if (hasUpgrade("s", 14)) mult = mult.times(3);

    return mult;
  },
  gainExp() {
    // Calculate the exponent on main currency from bonuses
    exp = new Decimal(1);
    return exp;
  },
  row: 1, // Row the layer is in on the tree (0 is the first row)
  hotkeys: [
    {
      key: "p",
      description: "P: Reset for prestige points",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  layerShown() {
    return hasMilestone("l", 1);
  },
  passiveGeneration() {
    let gen = 0;
    if (hasMilestone("s", 1)) gen = 1;

    return gen;
  },
  doReset(resettingLayer) {
    let keep = [];

    if (layers[resettingLayer].row > this.row) layerDataReset("p", keep);
  },
  tabFormat: {
    Main: {
      content: [
        "main-display",
        "prestige-button",
        "resource-display",

        "upgrades",
      ],
    },
  },
  upgrades: {
    11: {
      title: "Doubled",
      description: "Double your point gain.",
      cost: new Decimal(1),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
    },
    12: {
      title: "Synergy",
      description: "Prestige points boost points.",
      cost: new Decimal(3),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
      effect() {
        // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
        let ret = player.p.points.add(2).pow(0.5).pow(0.97);
        if (hasUpgrade("p", 14)) ret = ret.pow(1.3);
        if (ret.gte("1e600")) ret = ret.sqrt().times("1e300");
        return ret;
      },
      effectDisplay() {
        return format(this.effect()) + "x";
      }, // Add formatting to the effect
    },
    13: {
      title: "More Points Needed",
      description: "Quadruple your point gain.",
      cost: new Decimal(10),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
    },
    14: {
      title: "Boost The Boost",
      description: "<b>Synergy</b> is raised to ^1.3 (before softcap).",
      cost: new Decimal(200),
      unlocked() {
        return hasMilestone("l", 2);
      }, // The upgrade is only visible when this is true
    },
    15: {
      title: "Prestige Boost",
      description: "Multiply prestige points by 1.4.",
      cost: new Decimal(600),
      unlocked() {
        return hasMilestone("l", 2);
      }, // The upgrade is only visible when this is true
    },
  },
});
addLayer("s", {
  name: "super", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "S", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),
    };
  },
  color: "lime",
  branches: ["p"],
  requires: new Decimal(1000), // Can be a function that takes requirement increases into account
  resource: "super points", // Name of prestige currency
  baseResource: "prestige points", // Name of resource prestige is based on
  baseAmount() {
    return player.p.points;
  }, // Get the current amount of baseResource
  type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  exponent: 0.5, // Prestige currency exponent
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1);
    if (hasUpgrade("s", 14)) mult = mult.times(3);
    if (hasUpgrade("s", 15)) mult = mult.times(4);
    if (hasMilestone("l", 4)) mult = mult.times(5);
    return mult;
  },
  gainExp() {
    // Calculate the exponent on main currency from bonuses
    exp = new Decimal(1);
    return exp;
  },
  row: 2, // Row the layer is in on the tree (0 is the first row)
  hotkeys: [
    {
      key: "s",
      description: "S: Reset for super points",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  layerShown() {
    return hasMilestone("l", 2);
  },
  passiveGeneration() {
    return 0;
  },
  doReset(resettingLayer) {
    let keep = [];

    if (layers[resettingLayer].row > this.row) layerDataReset("s", keep);
  },
  effect() {
    let eff = player.s.points.add(1).pow(2).pow(0.6).floor();
    if (eff.gte(1e6)) eff = eff.sqrt().times(1000);
    if (eff.gte(1e30)) eff = eff.sqrt().times(1e15);
    if (eff.gte(1e100)) eff = eff.sqrt().times(1e50);
    if (eff.gte(1e250)) eff = new Decimal(1e250);

    return eff;
  },
  effectDescription() {
    // Optional text to describe the effects
    eff = this.effect();
    return "which boosts points by " + formatWhole(eff) + "x.";
  },
  tabFormat: {
    Main: {
      content: [
        "main-display",
        "prestige-button",
        "resource-display",

        "milestones",
        "upgrades",
      ],
    },
  },
  milestones: {
    1: {
      requirementDescription: "20 Super Points",
      done() {
        return player.s.points.gte(20) && hasMilestone("l", 3);
      }, // Used to determine when to give the milestone
      effectDescription: "Gain 100% of prestige gain per second.",
      unlocked() {
        return hasMilestone("l", 3);
      },
    },
  },
  upgrades: {
    11: {
      title: "Doubled^2",
      description: "Quadruple your point gain.",
      cost: new Decimal(1),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
    },
    12: {
      title: "More Prestige",
      description: "Triple your prestige point gain.",
      cost: new Decimal(3),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
    },
    13: {
      title: "Big Boost",
      description: "10x point gain.",
      cost: new Decimal(50),
      unlocked() {
        return hasMilestone("l", 3);
      }, // The upgrade is only visible when this is true
    },
    14: {
      title: "Lot's Of Boost",
      description: "3x points, prestige points, and super points.",
      cost: new Decimal(100),
      unlocked() {
        return hasMilestone("l", 3);
      }, // The upgrade is only visible when this is true
    },
    15: {
      title: "More Super",
      description: "Quadruple super points.",
      cost: new Decimal(10000),
      unlocked() {
        return hasMilestone("l", 3);
      }, // The upgrade is only visible when this is true
    },
  },
});

addLayer("pt", {
  name: "protons", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "PNE", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: true,
      points: new Decimal(0),
    };
  },

  color: "red",
  branches: ["p"],
  requires: new Decimal(1e10), // Can be a function that takes requirement increases into account
  resource: "protons", // Name of prestige currency
  baseResource: "prestige points", // Name of resource prestige is based on
  baseAmount() {
    return player.p.points;
  }, // Get the current amount of baseResource
  type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  exponent: 0.25, // Prestige currency exponent
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1);
    if (hasUpgrade("pt", 11)) mult = mult.times(3);
    return mult;
  },
  gainExp() {
    // Calculate the exponent on main currency from bonuses
    exp = new Decimal(1);
    return exp;
  },
  row: 2, // Row the layer is in on the tree (0 is the first row)

  layerShown() {
    return hasMilestone("l", 4);
  },
  passiveGeneration() {
    if (hasMilestone("l", 4)) return 1;
    else return 0;
  },
  doReset(resettingLayer) {
    let keep = [];

    if (layers[resettingLayer].row > this.row) layerDataReset("pt", keep);
  },

  tabFormat: {
    Protons: {
      content: [["infobox", "ptinfo"], "main-display", "upgrades"],
    },
  },
  infoboxes: {
    ptinfo: {
      title: "Proton Info",
      body: "Protons are generated based on prestige points after 1e10. This layer will also have 2 other currencies.",
    },
  },
  upgrades: {
    11: {
      title: "Protonic",
      description: "Triple proton gain.",
      cost: new Decimal(25),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
    },
    12: {
      title: "The End",
      description: "Beat the game (for now).",
      cost: new Decimal(100),
      unlocked() {
        return player[this.layer].unlocked;
      }, // The upgrade is only visible when this is true
    },
  },
});
