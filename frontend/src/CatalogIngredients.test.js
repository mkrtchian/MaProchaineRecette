import React from "react";
import { render, fireEvent, within, waitFor } from "@testing-library/react";
import axios from "axios";
import CatalogIngredients from "./CatalogIngredients";

require("mutationobserver-shim");

jest.mock("axios");
let catalogIngredients;

beforeEach(() => {
  catalogIngredients = [
    {
      name: "Fraises",
    },
    {
      name: "Mascarpone",
    },
  ];
});

afterEach(() => {
  jest.clearAllMocks();
});

const handlePossibleIngredients = (ingredients) => {
  catalogIngredients = ingredients;
};

const rerenderCatalog = (rerender) => {
  rerender(
    <CatalogIngredients
      possibleIngredients={catalogIngredients}
      updatePossibleIngredients={handlePossibleIngredients}
    />
  );
};

it("removes the correct ingredient when clicking on remove button", async () => {
  const { getByText, getAllByRole, rerender } = render(
    <CatalogIngredients
      possibleIngredients={catalogIngredients}
      updatePossibleIngredients={handlePossibleIngredients}
    />
  );
  const axiosDeleteResponse = { data: "" };
  axios.delete.mockResolvedValue(axiosDeleteResponse);
  const ingredient = getByText("Fraises", { exact: false });
  const button = within(ingredient).getByText("X");
  fireEvent.click(button);
  await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));
  rerenderCatalog(rerender);
  const listItems = getAllByRole("listitem");
  expect(ingredient).not.toBeInTheDocument();
  expect(listItems).toHaveLength(1);
});

it(`displays an error message and keeps the ingredient if the ingredient removal
was not successful on backend side`, async () => {
  const { getByText, getAllByRole, rerender } = render(
    <CatalogIngredients
      possibleIngredients={catalogIngredients}
      updatePossibleIngredients={handlePossibleIngredients}
    />
  );
  const axiosDeleteResponse = { data: "" };
  axios.delete.mockRejectedValue(axiosDeleteResponse);
  const ingredient = getByText("Fraises", { exact: false });
  const button = within(ingredient).getByText("X");
  fireEvent.click(button);
  await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));
  rerenderCatalog(rerender);
  const listItems = getAllByRole("listitem");
  expect(ingredient).toBeInTheDocument();
  expect(listItems).toHaveLength(2);
  const error = getByText(/La suppression a échoué/);
  expect(error).toBeInTheDocument();
});

it(`adds the correct ingredient when filling the form and clicking
  on submit`, async () => {
  const { getByLabelText, getByText, getAllByRole, rerender } = render(
    <CatalogIngredients
      possibleIngredients={catalogIngredients}
      updatePossibleIngredients={handlePossibleIngredients}
    />
  );
  const axiosPostResponse = { data: { name: "Chocolat" } };
  axios.post.mockResolvedValue(axiosPostResponse);
  const inputName = getByLabelText("Nom de l'ingrédient à ajouter :");
  const submitButton = getByText("Envoyer");
  fireEvent.change(inputName, { target: { value: "Chocolat" } });
  fireEvent.click(submitButton);
  await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
  rerenderCatalog(rerender);
  const ingredient = getByText("Chocolat", { exact: false });
  const listItems = getAllByRole("listitem");
  expect(listItems).toHaveLength(3);
  expect(ingredient).toBeInTheDocument();
});

it(`displays an error message and does not add the ingredient if the ingredient adding
was not successful on backend side`, async () => {
  const {
    getByLabelText,
    getByText,
    queryByText,
    getAllByRole,
    rerender,
  } = render(
    <CatalogIngredients
      possibleIngredients={catalogIngredients}
      updatePossibleIngredients={handlePossibleIngredients}
    />
  );
  const axiosPostResponse = {};
  axios.post.mockRejectedValue(axiosPostResponse);
  const inputName = getByLabelText("Nom de l'ingrédient à ajouter :");
  const submitButton = getByText("Envoyer");
  fireEvent.change(inputName, { target: { value: "Chocolat" } });
  fireEvent.click(submitButton);
  await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
  rerenderCatalog(rerender);
  const ingredient = queryByText("Chocolat", { exact: false });
  const listItems = getAllByRole("listitem");
  expect(listItems).toHaveLength(2);
  expect(ingredient).not.toBeInTheDocument();
  const error = getByText(/L'ajout a échoué/);
  expect(error).toBeInTheDocument();
});

describe("the search bar functionality works properly", () => {
  it(`displays the correct ingredients when a letter is entered in the
    search bar`, () => {
    const { getByText, queryByText, getByPlaceholderText } = render(
      <CatalogIngredients
        possibleIngredients={catalogIngredients}
        updatePossibleIngredients={handlePossibleIngredients}
      />
    );
    const searchBar = getByPlaceholderText("Recherche...");
    fireEvent.change(searchBar, { target: { value: "M" } });
    expect(getByText("Mascarpone")).toBeInTheDocument();
    expect(queryByText("Fraises")).not.toBeInTheDocument();
    fireEvent.change(searchBar, { target: { value: "Fra" } });
    expect(getByText("Fraises")).toBeInTheDocument();
    expect(queryByText("Mascarpone")).not.toBeInTheDocument();
  });

  it("redisplays all the ingredient of the catalog after a search", () => {
    const { getByText, queryByText, getByPlaceholderText } = render(
      <CatalogIngredients
        possibleIngredients={catalogIngredients}
        updatePossibleIngredients={handlePossibleIngredients}
      />
    );
    const searchBar = getByPlaceholderText("Recherche...");
    fireEvent.change(searchBar, { target: { value: "fr" } });
    expect(getByText("Fraises")).toBeInTheDocument();
    expect(queryByText("Mascarpone")).not.toBeInTheDocument();
    fireEvent.change(searchBar, { target: { value: "" } });
    expect(getByText("Fraises")).toBeInTheDocument();
    expect(getByText("Mascarpone")).toBeInTheDocument();
  });
});