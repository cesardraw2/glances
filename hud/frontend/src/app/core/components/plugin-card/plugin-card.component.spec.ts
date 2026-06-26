import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PluginCardComponent } from './plugin-card.component';
import { Component } from '@angular/core';

@Component({
  template: `<app-plugin-card><div class="project-test">Test Content</div></app-plugin-card>`,
  imports: [PluginCardComponent],
  standalone: true
})
class TestHostComponent {}

describe('PluginCardComponent', () => {
  let component: PluginCardComponent;
  let fixture: ComponentFixture<PluginCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PluginCardComponent, TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PluginCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render content projection correctly', () => {
    const hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();
    
    const compiled = hostFixture.nativeElement as HTMLElement;
    const projectedEl = compiled.querySelector('.project-test');
    
    expect(projectedEl).toBeTruthy();
    expect(projectedEl?.textContent).toContain('Test Content');
  });

  it('should apply the correct wrapper CSS classes', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const wrapper = compiled.querySelector('div');
    
    expect(wrapper).toBeTruthy();
    expect(wrapper?.classList.contains('font-mono')).toBe(true);
    expect(wrapper?.classList.contains('text-[12px]')).toBe(true);
    expect(wrapper?.classList.contains('text-[#ccc]')).toBe(true);
  });
});
