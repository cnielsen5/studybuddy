import { importSheetsToLibraryBundle } from "../src/import/sheetsToLibraryBundle.js";

describe("importSheetsToLibraryBundle", () => {
  it("builds a conformant library bundle from sheet CSV exports", () => {
    const conceptsCsv = [
      "ID,Library,domain,category,subcategory,topic,subtopic,concept_title,concept_definition,concept_summary,created_at,updated_at,created_by,last_updated_by,version,status,tags,search_keywords,difficulty,high_yield_score,source_name,source_chapter,prerequisites,relations,cards,questions,relations.questions_all,relations.cards_all,isSuspended",
      'ob_recon_001,OrthoBullets,Recon,Recon Science,Recon Science,Arthroplasty,Wear,Wear Overview,Definition one,Summary one,6/23/2026 16:54:04,6/23/2026 16:54:04,colby,colby,1.00,pending review,Core,keyword,5.5,high,OrthoBullets,Chapter,,,,"[""q_ob_recon_001_001""]","[""cd_ob_recon_001_001""]",',
      'ob_recon_002,OrthoBullets,Recon,Recon Science,Recon Science,Arthroplasty,Wear,Step 2,Definition two,Summary two,6/23/2026 16:54:04,6/23/2026 16:54:04,colby,colby,1.00,pending review,Core,keyword,5.5,high,OrthoBullets,Chapter,,,,,[],[],',
    ].join("\n");

    const cardsCsv = [
      "Card ID,Type,Concept ID,Card Type,pedagogicalRole,Front (Question),Back (Answer),Cloze1,Hint1",
      "cd_ob_recon_001_001,card,ob_recon_001,basic,,What is osteolysis?,A histiocytic response.,,",
      "cd_ob_recon_001_002,card,ob_recon_001,cloze,,Step {c1::two} follows step one.,Step two follows step one.,two,Hint",
    ].join("\n");

    const questionsCsv = [
      "id,type,relations.concept_id_01,config.question_type,config.cognitive_level,metadata.created_at,metadata.updated_at,metadata.created_by,metadata.last_updated_by,metadata.version,metadata.status,metadata.tags,metadata.difficulty,content.stem,content.options.opt_A.text,content.options.opt_B.text,content.options.opt_C.text,content.options.opt_D.text,content.options.opt_E.text,content.correct_option_id,explanations.general",
      "q_ob_recon_001_001,question,ob_recon_001,mcq,diagnosis,6/23/2026 16:54:04,6/23/2026 16:54:04,colby,colby,1.0,draft,Core,easy,Which cytokine inhibits osteolysis?,IL-1,IL-6,TNF,IFN-gamma,RANKL,4,Only IFN-gamma inhibits osteolysis.",
    ].join("\n");

    const bundle = importSheetsToLibraryBundle({
      conceptsCsv,
      cardsCsv,
      questionsCsv,
      libraryId: "lib_orthobullets_recon_test",
    });

    expect(bundle.concepts).toHaveLength(2);
    expect(bundle.cards).toHaveLength(2);
    expect(bundle.questions).toHaveLength(1);
    expect(bundle.concepts[0].id).toBe("concept_ob_recon_001");
    expect(bundle.cards[0].id).toBe("card_ob_recon_001_001");
    expect(bundle.cards[1].content.cloze_data?.cloze_fields[0]?.answer).toBe("two");
    expect(bundle.concepts[0].linked_content.card_ids).toContain("card_ob_recon_001_001");
    expect(bundle.concepts[0].linked_content.question_ids).toContain("q_ob_recon_001_001");
  });
});
