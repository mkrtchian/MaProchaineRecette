import React, { useState } from "react";
import { useForm } from "react-hook-form";
import InputSuggestions from "./InputSuggestions";
import PropTypes from "prop-types";

function RecettesForm({ onSubmitRecette, ingredientsPossibles }) {
  const { register, handleSubmit, errors, reset, watch, getValues } = useForm();
  const [ingredients, setIngredients] = useState([]);
  const [ingredientNom, setIngredientNom] = useState("");
  const [ingredientQuantite, setIngredientQuantite] = useState("");
  const [ingredientUnite, setIngredientUnite] = useState("");
  const [ingredientError, setIngredientError] = useState("");

  const onSubmitForm = (data) => {
    if (ingredients.length === 0) {
      setIngredientError(
        "Au moins un ingrédient doit être présent dans la recette"
      );
      return;
    }
    data.ingredients = ingredients.slice();
    onSubmitRecette(data);
    reset();
    setIngredients([]);
    resetIngredient();
  };

  const resetIngredient = () => {
    setIngredientNom("");
    setIngredientQuantite("");
    setIngredientUnite("");
    setIngredientError("");
  };

  class UnauthorizedIngredient extends Error {}

  const validateNewIngredient = () => {
    if (!ingredientNom || !ingredientQuantite || !ingredientUnite) {
      throw new Error(
        "Tous les champs concernant l'ingrédient doivent être remplis"
      );
    }
    let authorized = false;
    for (const ingredientPossible of ingredientsPossibles) {
      if (ingredientPossible.nom === ingredientNom) {
        authorized = true;
        break;
      }
    }
    if (!authorized) {
      throw new UnauthorizedIngredient(
        "Cet ingrédient n'existe pas dans le catalogue d'ingrédients. Vous pouvez l'y ajouter "
      );
    }
    for (let ingredientExistant of ingredients) {
      if (ingredientExistant.nom === ingredientNom) {
        throw new Error("Cet ingrédient a déjà été ajouté");
      }
    }
    if (ingredientQuantite <= 0) {
      throw new Error("La quantité doit être supérieure à 0");
    }
  };

  const handleAddIngredient = (event) => {
    event.preventDefault();
    try {
      validateNewIngredient();
      const newIngredients = ingredients.slice();
      newIngredients.push({
        nom: ingredientNom,
        quantite: ingredientQuantite,
        unite: ingredientUnite,
      });
      setIngredients(newIngredients);
      resetIngredient();
    } catch (error) {
      if (error instanceof UnauthorizedIngredient) {
        const message = (
          <React.Fragment>
            {error.message}
            <a href="/#">ici</a>.
          </React.Fragment>
        );
        setIngredientError(message);
      } else {
        setIngredientError(error.message);
      }
    }
  };

  const handleSupprIngredient = (nom) => {
    const ingredientsListUpdated = ingredients.slice();
    for (let i = 0; i < ingredientsListUpdated.length; i++) {
      if (ingredientsListUpdated[i].nom === nom) {
        ingredientsListUpdated.splice(i, 1);
        setIngredients(ingredientsListUpdated);
        return;
      }
    }
  };

  const validateCategories = () => {
    const categorie0 = watch("categorie[0]");
    const categorie1 = watch("categorie[1]");
    const categorie2 = watch("categorie[2]");
    return Boolean(categorie0 || categorie1 || categorie2);
  };

  const validateTime = () => {
    const hoursAndMinutes = getValues().tempsRecette.split(":");
    const hours = parseInt(hoursAndMinutes[0], 10);
    const minutes = hoursAndMinutes[1] ? parseInt(hoursAndMinutes[1], 10) : 0;
    const time = hours + minutes / 60;
    if (time <= 0) {
      return "Le temps nécessaire pour la recette doit être supérieur à 0";
    } else return undefined;
  };

  return (
    <form id="formRecette" onSubmit={handleSubmit(onSubmitForm)}>
      <fieldset>
        <legend>Ajouter une recette dans mon catalogue</legend>
        <div>
          <label htmlFor="titreRecette"> Titre de la recette : </label>
          <input
            type="text"
            name="titreRecette"
            id="titreRecette"
            defaultValue=""
            ref={register({ required: true })}
          />
          {errors.titreRecette && <span>Ce champ est obligatoire</span>}
        </div>
        <div>
          Catégories :
          <ul>
            <li>
              <input
                type="checkbox"
                value="Entrée"
                name="categorie[0]"
                aria-label="Entrée"
                ref={register({ validate: validateCategories })}
              />
              Entrée
            </li>
            <li>
              <input
                type="checkbox"
                value="Plat"
                name="categorie[1]"
                aria-label="Plat"
                ref={register({ validate: validateCategories })}
              />
              Plat
            </li>
            <li>
              <input
                type="checkbox"
                value="Dessert"
                name="categorie[2]"
                aria-label="Dessert"
                ref={register({ validate: validateCategories })}
              />
              Dessert
            </li>
          </ul>
          {errors.categorie && (
            <span>Au moins une catégorie doit être sélectionnée</span>
          )}
        </div>
        <div>
          <label htmlFor="tempsRecette"> Temps total de la recette : </label>
          <input
            type="time"
            id="tempsRecette"
            name="tempsRecette"
            ref={register({
              required: "Ce champ est obligatoire",
              validate: validateTime,
            })}
          />
          {errors.tempsRecette && errors.tempsRecette.message}
        </div>
        <fieldset>
          <legend> Ingrédients : </legend>
          <label htmlFor="ingredient"> Nom : </label>
          <InputSuggestions
            elements={ingredientsPossibles}
            id="ingredient"
            getElementText={(ingredient) => ingredient.nom}
            onChangeValue={(nom) => setIngredientNom(nom)}
            value={ingredientNom}
            name="ingredient"
            type="text"
          />
          <label htmlFor="ingredientQuantite"> Quantité nécessaire : </label>
          <input
            type="number"
            name="ingredientQuantite"
            id="ingredientQuantite"
            min="0"
            onChange={(e) => setIngredientQuantite(e.target.value)}
            value={ingredientQuantite}
          />
          <select
            name="unite"
            aria-label="Unité"
            onChange={(e) => setIngredientUnite(e.target.value)}
            value={ingredientUnite}
          >
            <option value="">...</option>
            <option value="pièce(s)">pièce(s)</option>
            <option value="kg">kg</option>
            <option value="g">g</option>
            <option value="cl">cl</option>
          </select>
          <button onClick={handleAddIngredient}>Ajouter</button>
          {ingredientError && <span>{ingredientError}</span>}
          <ul>
            {ingredients.map((ingredient) => {
              return (
                <li key={ingredient.nom}>
                  {ingredient.nom} : {ingredient.quantite} {ingredient.unite}
                  <button onClick={() => handleSupprIngredient(ingredient.nom)}>
                    X
                  </button>
                </li>
              );
            })}
          </ul>
        </fieldset>
        <div>
          <label htmlFor="descriptionRecette">Corps de la recette : </label>
          <textarea
            id="descriptionRecette"
            name="descriptionRecette"
            spellCheck="true"
            ref={register({ required: true })}
          ></textarea>
          {errors.descriptionRecette && <span>Ce champ est obligatoire</span>}
        </div>
        <input type="submit" value="Confirmer" />
      </fieldset>
    </form>
  );
}

RecettesForm.propTypes = {
  /**
   * Cette fonction est exécutée au moment du submit de de la recette,
   * lorsque la validité de tous les éléments entrés a été vérifiée,
   * et permet de les récupérer.
   */
  onSubmitRecette: PropTypes.func.isRequired,
  /**
   * Il s'agit ici des ingrédients autorisés, c'est-à-dire ceux entrés
   * dans le catalogue des ingrédients.
   */
  ingredientsPossibles: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      nom: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default RecettesForm;
