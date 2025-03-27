jest.setTimeout(15000);

jest.mock('../models/Management');
jest.mock('../models/Employee');
jest.mock('../models/Company');

const searchController = require('../controllers/searchController');
const Management = require('../models/Management');
const Employee = require('../models/Employee');
const Company = require('../models/Company');

let adminManagementUid, regularManagementUid, regularManagementCompanyId, employeeCompanyId, seededCompany;

beforeAll(async () => {
    // Set up mocks for Management.findOne, Employee.findOne, Company.findOne
    Management.findOne = jest.fn().mockImplementation((query) => {
        // Check for uid queries first
        if (query.uid === "adminUID") {
            return Promise.resolve({ uid: "adminUID", firstName: "Admin", lastName: "User", companyId: "comp1", isAdmin: true });
        }
        if (query.uid === "regularUID") {
            return Promise.resolve({ uid: "regularUID", firstName: "Regular", lastName: "Manager", companyId: "comp2", isAdmin: false });
        }
        // Fallback using firstName and lastName if uid not provided
        if (query.firstName === "Admin" && query.lastName === "User") {
            return Promise.resolve({ uid: "adminUID", firstName: "Admin", lastName: "User", companyId: "comp1", isAdmin: true });
        }
        if (query.firstName === "Regular" && query.lastName === "Manager") {
            return Promise.resolve({ uid: "regularUID", firstName: "Regular", lastName: "Manager", companyId: "comp2", isAdmin: false });
        }
        return Promise.resolve(null);
    });

    Employee.findOne = jest.fn().mockImplementation((query) => {
        if (query.firstName === "Employee" && query.lastName === "User") {
            return Promise.resolve({ uid: "employeeUID", firstName: "Employee", lastName: "User", companyId: "comp2" });
        }
        return Promise.resolve(null);
    });

    Company.findOne = jest.fn().mockImplementation((query) => {
        // For simplicity, return a dummy company if companyName regex matches
        return Promise.resolve({ companyId: "comp2", companyName: "Company 2" });
    });

    // Seed the variables from the mocked responses:
    const adminManagement = await Management.findOne({ uid: "adminUID" });
    if (adminManagement) {
        adminManagementUid = adminManagement.uid;
    }
    const regularManagement = await Management.findOne({ uid: "regularUID" });
    if (regularManagement) {
        regularManagementUid = regularManagement.uid;
        regularManagementCompanyId = regularManagement.companyId;
    }
    const employee = await Employee.findOne({ firstName: "Employee", lastName: "User" });
    if (employee) {
        employeeCompanyId = employee.companyId;
    }
    seededCompany = await Company.findOne({ companyName: /Company/ });

    // Also, mock the find methods used in search strategies:
    Employee.find = jest.fn().mockResolvedValue([
        { firstName: "Employee", lastName: "User", companyId: regularManagementCompanyId, uid: "employeeUID" }
    ]);
    Company.find = jest.fn().mockResolvedValue([
        { companyId: seededCompany.companyId, companyName: seededCompany.companyName }
    ]);
});

afterAll(async () => {
    // Optionally, close any open connections if needed.
});

describe('User Search Strategies', () => {
    let req, res;

    beforeEach(() => {
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    test('should return employees for regular management search within the company', async () => {
        req.body = {
            type: 'employee',
            query: 'Employee',
            userRole: 'management',
            companyId: regularManagementCompanyId,
            uid: regularManagementUid
        };

        await searchController.search(req, res);

        // Check that the response contains the mocked employee record.
        const result = res.json.mock.calls[0][0];
        expect(result.results).toBeInstanceOf(Array);
        const employeeRecord = result.results.find(emp =>
            emp.firstName === "Employee" && emp.lastName === "User"
        );
        expect(employeeRecord).toBeDefined();
    });

    test('should return all employees for admin management search', async () => {
        req.body = {
            type: 'employee',
            query: 'Employee',
            userRole: 'management',
            companyId: null,
            uid: adminManagementUid
        };

        await searchController.search(req, res);

        const result = res.json.mock.calls[0][0];
        expect(result.results).toBeInstanceOf(Array);
        const employeeRecord = result.results.find(emp =>
            emp.firstName === "Employee" && emp.lastName === "User"
        );
        expect(employeeRecord).toBeDefined();
    });

    test('should return companies data for company search', async () => {
        req.body = {
            type: 'company',
            query: seededCompany.companyName,
            uid: "guest" // company searches allow guest uid
        };

        await searchController.search(req, res);

        const result = res.json.mock.calls[0][0];
        expect(result.results).toBeInstanceOf(Array);
        const companyRecord = result.results.find(comp =>
            comp.companyName === seededCompany.companyName
        );
        expect(companyRecord).toBeDefined();
    });

    test('should deny access for user-specific search when uid is guest', async () => {
        req.body = {
            type: 'employee',
            query: 'Employee',
            userRole: 'management',
            companyId: regularManagementCompanyId,
            uid: "guest"
        };

        await searchController.search(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: 'Access denied: guest users cannot perform this search.' });
    });
});
