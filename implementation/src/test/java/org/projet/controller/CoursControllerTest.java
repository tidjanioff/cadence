package org.projet.controller;

import io.javalin.http.Context;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.mockito.Mockito.*;

public class CoursControllerTest {

    
    @Test
    @DisplayName("Comparaison avec cours invalides")
    void testComparerCours_withInvalidCourseIds() {
        CoursController controller = new CoursController();
        Context ctx = mock(Context.class);
        CoursController.RequeteComparaison req = new CoursController.RequeteComparaison();
        req.cours = new String[]{"INVALID1", "INVALID2"};
        req.criteres = new String[]{"name", "credits"};
        when(ctx.bodyAsClass(CoursController.RequeteComparaison.class)).thenReturn(req);

        controller.comparerCours(ctx);
        verify(ctx).status(400);
    }


    //Tests pour rechercherCours

    @Test
    @DisplayName("Recherche de cours par ID valide")
    void testRechercherCours_byValidId() {
        CoursController controller = new CoursController();
        Context ctx = mock(Context.class);
        CoursController.RequeteRecherche req = new CoursController.RequeteRecherche();
        req.param = "id";
        req.valeur = "IFT1025";
        req.includeSchedule = "false";
        req.semester = null;

        when(ctx.bodyAsClass(CoursController.RequeteRecherche.class)).thenReturn(req);

        controller.rechercherCours(ctx);

        verify(ctx).status(anyInt());
    }

    @Test
    @DisplayName("Recherche de cours par nom")
    void testRechercherCours_byName() {
        CoursController controller = new CoursController();
        Context ctx = mock(Context.class);
        CoursController.RequeteRecherche req = new CoursController.RequeteRecherche();
        req.param = "name";
        req.valeur = "Algorithmic";
        req.includeSchedule = "false";
        req.semester = null;

        when(ctx.bodyAsClass(CoursController.RequeteRecherche.class)).thenReturn(req);

        controller.rechercherCours(ctx);

        verify(ctx).status(anyInt());
    }

    @Test
    @DisplayName("Recherche de cours par description")
    void testRechercherCours_byDescription() {
        CoursController controller = new CoursController();
        Context ctx = mock(Context.class);
        CoursController.RequeteRecherche req = new CoursController.RequeteRecherche();
        req.param = "description";
        req.valeur = "fundamentals";
        req.includeSchedule = "false";
        req.semester = null;

        when(ctx.bodyAsClass(CoursController.RequeteRecherche.class)).thenReturn(req);

        controller.rechercherCours(ctx);

        verify(ctx).status(anyInt());
    }

    @Test
    @DisplayName("Recherche avec paramètre invalide")
    void testRechercherCours_byInvalidParam() {
        CoursController controller = new CoursController();
        Context ctx = mock(Context.class);
        CoursController.RequeteRecherche req = new CoursController.RequeteRecherche();
        req.param = "invalid_param";
        req.valeur = "value";
        req.includeSchedule = "false";
        req.semester = null;

        when(ctx.bodyAsClass(CoursController.RequeteRecherche.class)).thenReturn(req);

        controller.rechercherCours(ctx);

        verify(ctx, atLeastOnce()).status(anyInt());
    }

    @Test
    @DisplayName("Recherche avec schedule et semester")
    void testRechercherCours_withScheduleAndSemester() {
        CoursController controller = new CoursController();
        Context ctx = mock(Context.class);
        CoursController.RequeteRecherche req = new CoursController.RequeteRecherche();
        req.param = "id";
        req.valeur = "IFT1025";
        req.includeSchedule = "true";
        req.semester = "FALL";

        when(ctx.bodyAsClass(CoursController.RequeteRecherche.class)).thenReturn(req);

        controller.rechercherCours(ctx);

        verify(ctx).status(anyInt());
    }

}
