SELECT livrable, tableur, tool_code, id_livrable, comp_id, cons_id,  name as company, date
FROM undptools.entreprises
join (
	(SELECT 'Diagnostic integrale' as livrable, 'matrice_diag_integral_note' as tableur, 't1d' as tool_code, id_diag_integ_note as id_livrable , comp_id, cons_id, date
	FROM undptools.matrice_diag_integral_note
	WHERE cons_id = 1)
	UNION
	(SELECT 'prediagnostic', 'mat_predia_crev_note', 'attribut' as tool_code, attr_id as id_livrable, comp_id, cons_id, date
	FROM undptools.mat_predia_crev_note
	WHERE cons_id = 1)
) Livrable
ON ( entreprises.id = Livrable.comp_id);
