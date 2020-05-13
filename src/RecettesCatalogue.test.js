import React from 'react';
import { render, fireEvent, act, within} from '@testing-library/react';
import RecettesCatalogue from './RecettesCatalogue';

require('mutationobserver-shim');

let recettes

beforeEach(() => {
  recettes = [
        {
          id : "001",
          categorie : ["Plat"],
          titre : "Salade de pommes de terre radis",
          ingredients : {"pommes de terre" : "1 kg", "oeufs" : "3", "vinaigre non balsamique" : "1 cas", "radis": "2 bottes", "oignons bottes" : "2 cas", "yaourt grec" : "1", "mayonnaise" : "1 cas", "moutarde" : "1/2 cas", "ail" : "1 gousse"},
          temps : "35 min",
          description : "Epluchez et coupez les patates en rondelles et les cuire à l'eau. Cuire les oeufs durs. Coupez les radis en rondelles. Emincez les échalottes et les oignons. Coupez les oeufs durs. Mettre le tout dans un saladier et rajoutez le vinaigre. Mélangez. Préparez la sauce :  mélangez le yaourt, la mayonnaise, la moutarde, la gousse d'ail rapée. Assaisoner.",
        },

        {
          id : "002",
          categorie : ["Entrée"],
          titre : "Marinade de saumon fumé",
          ingredients : {"saumon fumé" : "200g", "citon vert" : "0,5", "vinaigre balsamique": "2 cas", "huile d'olive" : "2 cas", "échalotte" : "1", "herbes fraiches" : "1 cas"},
          temps : "11 h",
          description : "Emincez le saumon, l'échalotte et le persil. Ajoutez le vinaigre, l'huile, le citron et un peu de poivre. Mélangez et laissez mariner toute la nuit."
        },
      ]});

describe ("the adding recipe functionality works properly", () => {
  it('adds the correct recipe when filling the form and clicking on submit', async () => {
    const { getByLabelText, getByText } = render(
      <RecettesCatalogue totalRecettes={recettes}/>);
    await addRecipe(getByLabelText, getByText);
    const recette = getByText("Crumble aux poires", { exact: false });
    const poires = getByText(/Poires/);
    const beurre = getByText(/Beurre/);
    expect(recette).toBeInTheDocument()
    expect(poires).toBeInTheDocument()
    expect(beurre).toBeInTheDocument()
  })

  it(`does not add the recipe if no ingredient was provided`, async () => {
    await checkMissingInput("ingredients")
  })

  it(`does not add the recipe if no category was provided`, async () => {
    await checkMissingInput("categories")
  })

  it(`does not add the recipe if no time was provided`, async () => {
    await checkMissingInput("temps")
  })

  it(`does not add the recipe if no description was provided`, async () => {
    await checkMissingInput("description")
  })

  async function checkMissingInput(inputName) {
    const { getByLabelText, getByText, queryByText } = render(
      <RecettesCatalogue totalRecettes={recettes}/>);
    await addRecipe(getByLabelText, getByText, [inputName]);
    const recette = queryByText("Crumble aux poires", { exact: false });
    expect(recette).not.toBeInTheDocument()
  }

  it(`does not add the recipe if no title was provided`, async () => {
    const { getByLabelText, getByText, queryByText } = render(
      <RecettesCatalogue totalRecettes={recettes}/>);
    await addRecipe(getByLabelText, getByText, ["titre"]);
    const recette = queryByText("Épluchez et épépinez", { exact: false });
    expect(recette).not.toBeInTheDocument()
  })

  it(`does not add the ingredient if an ingredient with the same name
    was already provided`, () => {
    const { getByLabelText, getByText, getAllByText } = render(
      <RecettesCatalogue totalRecettes={recettes}/>);
    addIngredient(getByLabelText, getByText, ["Grenade", 500, "g"])
    addIngredient(getByLabelText, getByText, ["Grenade", 5, "g"])
    const ingredient = getAllByText(/Grenade/);
    expect(ingredient).toHaveLength(1)
  })

  it(`does not add the recipe if the time for the recipe is negative or null`,
    async () => {
    const { getByLabelText, getByText, queryByText } = render(
        <RecettesCatalogue totalRecettes={recettes}/>);
    await addRecipe(getByLabelText, getByText, [], {"temps": "00:00"})
    let recette = queryByText("Crumble aux poires", { exact: false });
    expect(recette).not.toBeInTheDocument()

    await addRecipe(getByLabelText, getByText, [], {"temps": "-01:00"})
    recette = queryByText("Crumble aux poires", { exact: false });
    expect(recette).not.toBeInTheDocument()
  })

  it(`does not add the ingredient if quantity is negative or null`, () => {
    const { getByLabelText, getByText, queryByText } = render(
      <RecettesCatalogue totalRecettes={recettes}/>);
    addIngredient(getByLabelText, getByText, ["Grenade", -1, "g"])
    let grenade = queryByText(/Grenade/);
    expect(grenade).not.toBeInTheDocument()
    addIngredient(getByLabelText, getByText, ["Grenade", 0, "g"])
    grenade = queryByText(/Grenade/);
    expect(grenade).not.toBeInTheDocument()
  })

  it(`removes ingredient on the form when clicking on the
    remove button`, async () => {
    const { getByLabelText, getByText } = render(
      <RecettesCatalogue totalRecettes={recettes}/>);
    addIngredient(getByLabelText, getByText, ["Poires", 1, "kg"])
    addIngredient(getByLabelText, getByText, ["Beurre", 30, "g"])
    const poires = getByText(/Poires/);
    const beurre = getByText(/Beurre/);
    const removeButton = within(poires).getByText("X");
    await act(async () => {
      fireEvent.click(removeButton)
    })
    expect(poires).not.toBeInTheDocument()
    expect(beurre).toBeInTheDocument()
  })

  it(`adds ingredients on the form when they are validated`, () => {
    const { getByLabelText, getByText } = render(
      <RecettesCatalogue totalRecettes={recettes}/>);
    addIngredient(getByLabelText, getByText, ["Poires", 1, "kg"])
    addIngredient(getByLabelText, getByText, ["Beurre", 30, "g"])
    const poires = getByText(/Poires/);
    const beurre = getByText(/Beurre/);
    expect(poires).toBeInTheDocument()
    expect(beurre).toBeInTheDocument()
  })

  async function addRecipe(getByLabelText, getByText, missingFields=[],
    customFields={}) {
    const inputTitre =  getByLabelText("Titre de la recette :");
    const entree = getByLabelText("Entrée");
    const inputTemps =  getByLabelText("Temps total de la recette :");
    const inputDescription = getByLabelText("Corps de la recette :");
    const submitButton = getByText("Confirmer");
    if (!missingFields.includes("titre")) {
      fireEvent.change(inputTitre, { target: { value: 'Crumble aux poires' } });
    }
    if (!missingFields.includes("categories")) {
      fireEvent.click(entree);
    }
    if (!missingFields.includes("temps")) {
      const temps = customFields["temps"] || "00:10"
      fireEvent.change(inputTemps, { target: { value: temps } })
    }
    if (!missingFields.includes("ingredients")) {
      addIngredient(getByLabelText, getByText, ["Poires", 1, "kg"])
      addIngredient(getByLabelText, getByText, ["Beurre", 30, "g"])
    }
    if (!missingFields.includes("description")) {
      fireEvent.change(inputDescription,
        { target:
          { value: '"Épluchez et épépinez les poires. Coupez-les en dés.' }
        }
      );
    }
    await act(async () => {
      fireEvent.click(submitButton);
    })
  }

  function addIngredient(getByLabelText, getByText, value) {
    const inputIngredientName = getByLabelText("Nom :");
    const inputQuantite = getByLabelText("Quantité nécessaire :");
    const selectedUnit = getByLabelText("Unité");
    const addButton = getByText("Ajouter");
    fireEvent.change(inputIngredientName, { target: { value: value[0] } });
    fireEvent.change(inputQuantite, { target: { value: value[1] } });
    fireEvent.change(selectedUnit, { target: { value: value[2] } });
    fireEvent.click(addButton);
  }
})

describe ("the removing recipe functionality works properly", () => {
  it("removes the recipe when clicking on the button", () => {
    const { getByText } = render(<RecettesCatalogue totalRecettes={recettes}/>);
    const recipeRemoved = getByText("Marinade de saumon fumé", { exact: false });
    const recipe = getByText("Salade de pommes de terre radis", { exact: false });
    const button = within(recipeRemoved).getByText("X");
    fireEvent.click(button);
    expect(recipeRemoved).not.toBeInTheDocument();
    expect(recipe).toBeInTheDocument();
  })
})
