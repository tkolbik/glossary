using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using System.Text;
using glossaryApi.Data;

namespace glossaryApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExportController : BaseController
    {
        private readonly AppDbContext _context;

        public ExportController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("terms/docx")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ExportTermsToDocx()
        {
            try
            {
                var terms = await _context.Terms.ToListAsync();
                
                var translations = await _context.Translations.ToListAsync();

                using var stream = new MemoryStream();
                using (var document = WordprocessingDocument.Create(stream, WordprocessingDocumentType.Document))
                {
                    var mainPart = document.AddMainDocumentPart();
                    mainPart.Document = new Document();
                    var body = mainPart.Document.AppendChild(new Body());

                    var titleParagraph = new Paragraph();
                    var titleRun = new Run();
                    var titleRunProperties = new RunProperties();
                    titleRunProperties.Append(new Bold());
                    titleRunProperties.Append(new FontSize() { Val = "32" });
                    titleRun.Append(titleRunProperties);
                    titleRun.Append(new Text("Glossary Export"));
                    titleParagraph.Append(titleRun);
                    body.Append(titleParagraph);

                    body.Append(new Paragraph());

                    foreach (var term in terms)
                    {
                        var termParagraph = new Paragraph();
                        var termRun = new Run();
                        var termRunProperties = new RunProperties();
                        termRunProperties.Append(new Bold());
                        termRunProperties.Append(new FontSize() { Val = "24" });
                        termRun.Append(termRunProperties);
                        termRun.Append(new Text(term.Name));
                        termParagraph.Append(termRun);
                        body.Append(termParagraph);

                        if (!string.IsNullOrEmpty(term.Description))
                        {
                            var descParagraph = new Paragraph();
                            var descRun = new Run();
                            var descRunProperties = new RunProperties();
                            descRunProperties.Append(new FontSize() { Val = "20" });
                            descRun.Append(descRunProperties);
                            descRun.Append(new Text(term.Description));
                            descParagraph.Append(descRun);
                            body.Append(descParagraph);
                        }

                        body.Append(new Paragraph());
                    }
                }

                stream.Position = 0;
                var fileName = $"glossary_export_{DateTime.Now:yyyyMMdd_HHmmss}.docx";
                
                return File(stream.ToArray(), "application/vnd.openxmlformats-officedocument.wordprocessingml.document", fileName);
            }
            catch (Exception ex)
            {
                return HandleError(ex, "exporting terms to DOCX");
            }
        }
    }
}
