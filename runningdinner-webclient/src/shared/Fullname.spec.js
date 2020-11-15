import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import Fullname from "./Fullname";

let container = null;
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

it("renders fullname or empty string", () => {
  const participant = {
    firstnamePart: 'Max',
    lastname: 'Mustermann'
  };
  act(() => {
    render(<Fullname {...participant} />, container);
  });
  expect(container.textContent).toBe("Max Mustermann");

  act(() => {
    render(<Fullname />, container);
  });
  expect(container.textContent).toBe("");
});