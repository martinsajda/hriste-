using Microsoft.Data.SqlClient;
using System.Data;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
app.UseDefaultFiles();
app.UseStaticFiles();

string ConnectionString() => app.Configuration.GetConnectionString("ContactsDb")
    ?? throw new InvalidOperationException("Missing ConnectionStrings:ContactsDb");

app.MapGet("/api/contacts", async () =>
{
    var rows = new List<Contact>();
    await using var connection = new SqlConnection(ConnectionString());
    await connection.OpenAsync();
    await using var command = new SqlCommand(
        "SELECT Id, FirstName, LastName, Phone FROM dbo.Contacts ORDER BY LastName, FirstName, Id", connection);
    await using var reader = await command.ExecuteReaderAsync();
    while (await reader.ReadAsync())
        rows.Add(new Contact(reader.GetInt32(0), reader.GetString(1), reader.GetString(2), reader.GetString(3)));
    return Results.Ok(rows);
});

app.MapPost("/api/contacts", async (ContactInput input) =>
{
    var first = input.FirstName?.Trim();
    var last = input.LastName?.Trim();
    var phone = input.Phone?.Trim();
    if (string.IsNullOrEmpty(first) || first.Length > 100 ||
        string.IsNullOrEmpty(last) || last.Length > 100 ||
        string.IsNullOrEmpty(phone) || phone.Length > 40)
        return Results.BadRequest(new { error = "FirstName, LastName and Phone are required and must fit length limits." });

    await using var connection = new SqlConnection(ConnectionString());
    await connection.OpenAsync();
    await using var command = new SqlCommand(
        "INSERT INTO dbo.Contacts (FirstName, LastName, Phone) OUTPUT INSERTED.Id VALUES (@first, @last, @phone)", connection);
    command.Parameters.Add("@first", SqlDbType.NVarChar, 100).Value = first;
    command.Parameters.Add("@last", SqlDbType.NVarChar, 100).Value = last;
    command.Parameters.Add("@phone", SqlDbType.NVarChar, 40).Value = phone;
    var id = Convert.ToInt32(await command.ExecuteScalarAsync());
    var contact = new Contact(id, first, last, phone);
    return Results.Created($"/api/contacts/{id}", contact);
});

app.MapDelete("/api/contacts/{id:int}", async (int id) =>
{
    await using var connection = new SqlConnection(ConnectionString());
    await connection.OpenAsync();
    await using var command = new SqlCommand("DELETE FROM dbo.Contacts WHERE Id = @id", connection);
    command.Parameters.Add("@id", SqlDbType.Int).Value = id;
    return await command.ExecuteNonQueryAsync() == 0 ? Results.NotFound() : Results.NoContent();
});

app.Run();

record Contact(int Id, string FirstName, string LastName, string Phone);
record ContactInput(string? FirstName, string? LastName, string? Phone);
