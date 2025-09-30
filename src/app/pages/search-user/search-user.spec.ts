import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchUserComponent } from './search-user';

describe('SearchUser', () => {
  let component: SearchUserComponent;
  let fixture: ComponentFixture<SearchUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
