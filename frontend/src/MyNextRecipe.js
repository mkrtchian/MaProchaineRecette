import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, NavLink } from "react-router-dom";
import axios from "axios";
import FridgeRecipes from "./FridgeRecipes";
import FridgeIngredients from "./FridgeIngredients";
import CatalogIngredients from "./CatalogIngredients";
import CatalogRecipes from "./CatalogRecipes";
import "./MyNextRecipe.css";
import "./Nav.css";

function MyNextRecipe() {
  const [catalogIngredients, setCatalogIngredients] = useState([]);
  const [catalogRecipes, setCatalogRecipes] = useState([]);
  const [fridgeIngredients, setFridgeIngredients] = useState([]);
  const [catalogCategories, setCatalogCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [feasibleRecipes, setFeasibleRecipes] = useState([]);
  const [fetchError, setFetchError] = useState("");

  const handlePossibleIngredients = (ingredients) => {
    setCatalogIngredients(ingredients);
  };

  useEffect(() => {
    axios
      .get("/catalogs/ingredients/")
      .then(({ data }) => {
        setCatalogIngredients(data);
      })
      .catch(() =>
        setFetchError(
          "Il y a eu une erreur vis-à-vis du serveur, veuillez reharger la page ou réessayer ultérieurement."
        )
      );
    axios
      .get("/catalogs/recipes/")
      .then(({ data }) => {
        setCatalogRecipes(data);
      })
      .catch(() =>
        setFetchError(
          "Il y a eu une erreur vis-à-vis du serveur, veuillez reharger la page ou réessayer ultérieurement."
        )
      );
    axios
      .get("/fridge/ingredients/")
      .then(({ data }) => {
        const newData = data.map((fridgeIngredient) => {
          return {
            id: fridgeIngredient.id,
            name: fridgeIngredient.ingredient,
            expirationDate: new Date(fridgeIngredient.expiration_date),
            amount: fridgeIngredient.amount,
            unit: fridgeIngredient.unit,
          };
        });
        setFridgeIngredients(newData);
      })
      .catch(() =>
        setFetchError(
          "Il y a eu une erreur vis-à-vis du serveur, veuillez reharger la page ou réessayer ultérieurement."
        )
      );
    axios
      .get("/catalogs/categories/")
      .then(({ data }) => {
        setCatalogCategories(data);
      })
      .catch(() =>
        setFetchError(
          "Il y a eu une erreur vis-à-vis du serveur, veuillez reharger la page ou réessayer ultérieurement."
        )
      );
    axios
      .get("/units/")
      .then(({ data }) => {
        setUnits(data);
      })
      .catch(() =>
        setFetchError(
          "Il y a eu une erreur vis-à-vis du serveur, veuillez reharger la page ou réessayer ultérieurement."
        )
      );
    axios
      .get("/fridge/recipes/")
      .then(({ data }) => {
        setFeasibleRecipes(data);
      })
      .catch(() =>
        setFetchError(
          "Il y a eu une erreur vis-à-vis du serveur, veuillez reharger la page ou réessayer ultérieurement."
        )
      );
  }, []);

  return (
    <Router>
      <div>
        <nav>
          <NavLink activeClassName="currentTab" exact={true} to="/">
            Ma prochaine recette
          </NavLink>
          <NavLink activeClassName="currentTab" to="/recipes">
            Catalogue des recettes
          </NavLink>
          <NavLink activeClassName="currentTab" to="/ingredients">
            Catalogue des ingrédients
          </NavLink>
        </nav>
        {fetchError && <span>{fetchError}</span>}
        <Route path="/recipes">
          <CatalogRecipes
            totalRecipes={catalogRecipes}
            possibleIngredients={catalogIngredients}
            totalCategories={catalogCategories}
            totalUnits={units}
          />
        </Route>
        <Route path="/ingredients">
          <CatalogIngredients
            possibleIngredients={catalogIngredients}
            updatePossibleIngredients={handlePossibleIngredients}
          />
        </Route>
        <Route path="/" exact>
          <main id="MyNextRecipes">
            <FridgeIngredients
              ingredients={fridgeIngredients}
              possibleIngredients={catalogIngredients}
              totalUnits={units}
            />
            <FridgeRecipes recipes={feasibleRecipes} />
          </main>
        </Route>
      </div>
    </Router>
  );
}

export default MyNextRecipe;