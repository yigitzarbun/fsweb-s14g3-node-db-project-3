-- Multi-Table Sorgu Pratiği

-- Tüm ürünler(product) için veritabanındaki ProductName ve CategoryName'i listeleyin. (77 kayıt göstermeli)
SELECT Product.ProductName, Category.CategoryName FROM PRODUCT JOIN CATEGORY ON Product.CategoryId = Category.Id;
-- 9 Ağustos 2012 öncesi verilmiş tüm siparişleri(order) için sipariş id'si (Id) ve gönderici şirket adını(CompanyName)'i listeleyin. (429 kayıt göstermeli)
 SELECT o.Id, c.CompanyName FROM [Order] o JOIN Customer c ON o.CustomerId = c.Id WHERE OrderDate < "2012-08-09"
-- Id'si 10251 olan siparişte verilen tüm ürünlerin(product) sayısını ve adını listeleyin. ProdcutName'e göre sıralayın. (3 kayıt göstermeli)
SELECT COUNT(ProductName) as "Product Qty", P.ProductName FROM OrderDetail od JOIN Product p on od.ProductId = p.Id where OrderId = 10251 group by ProductName 
-- Her sipariş için OrderId, Müşteri'nin adını(Company Name) ve çalışanın soyadını(employee's LastName). Her sütun başlığı doğru bir şekilde isimlendirilmeli. (16.789 kayıt göstermeli)
SELECT o.Id, c.CompanyName, e.LastName FROM [Order] o JOIN Customer c ON o.CustomerId = c.Id JOIN Employee e ON o.EmployeeId = e.Id